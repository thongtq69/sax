import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { writeFile } from 'node:fs/promises'

type InspectResult = {
  url: string
  verdict?: string
  coverageState?: string
  indexingState?: string
  robotsTxtState?: string
  pageFetchState?: string
  googleCanonical?: string
  userCanonical?: string
  lastCrawlTime?: string
  error?: string
}

type Args = {
  siteUrl: string
  sitemapUrl: string
  urls: string[]
  limit?: number
  output?: string
  json: boolean
  help: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    siteUrl: process.env.GSC_SITE_URL || 'https://www.jamessaxcorner.com/',
    sitemapUrl: process.env.GSC_SITEMAP_URL || 'https://www.jamessaxcorner.com/sitemap.xml',
    urls: [],
    json: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]

    if (arg === '--site' && next) {
      args.siteUrl = next
      i += 1
    } else if (arg === '--sitemap' && next) {
      args.sitemapUrl = next
      i += 1
    } else if (arg === '--url' && next) {
      args.urls.push(next)
      i += 1
    } else if (arg === '--limit' && next) {
      args.limit = Number(next)
      i += 1
    } else if (arg === '--output' && next) {
      args.output = next
      i += 1
    } else if (arg === '--json') {
      args.json = true
    } else if (arg === '--help' || arg === '-h') {
      args.help = true
    }
  }

  if (!args.siteUrl.endsWith('/')) {
    args.siteUrl = `${args.siteUrl}/`
  }

  return args
}

function printHelp() {
  console.log(`Usage: npm run seo:inspect -- [options]

Options:
  --site <url>       Search Console property URL-prefix
  --sitemap <url>    Sitemap XML URL
  --url <url>        Inspect one URL (repeatable)
  --limit <n>        Limit URLs pulled from sitemap
  --output <path>    Save JSON report to a file
  --json             Print raw JSON summary
  --help             Show this help

Auth (choose one):
  1) Service account:
     GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json

  2) OAuth refresh token:
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     GOOGLE_REFRESH_TOKEN=...

Examples:
  npm run seo:inspect -- --limit 10
  npm run seo:inspect -- --url https://www.jamessaxcorner.com/ --url https://www.jamessaxcorner.com/shop
  npm run seo:inspect -- --limit 20 --output reports/gsc-inspection.json
`)
}

async function createAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (clientId && clientSecret && refreshToken) {
    const auth = new OAuth2Client(clientId, clientSecret)
    auth.setCredentials({ refresh_token: refreshToken })
    return auth
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
  }

  throw new Error(
    'Missing Google auth. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN.'
  )
}

async function fetchSitemapUrls(sitemapUrl: string) {
  const response = await fetch(sitemapUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  const matches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g))
  return matches.map((match) => match[1].trim())
}

function summarize(result: any, url: string): InspectResult {
  const indexStatus = result?.inspectionResult?.indexStatusResult

  return {
    url,
    verdict: indexStatus?.verdict,
    coverageState: indexStatus?.coverageState,
    indexingState: indexStatus?.indexingState,
    robotsTxtState: indexStatus?.robotsTxtState,
    pageFetchState: indexStatus?.pageFetchState,
    googleCanonical: indexStatus?.googleCanonical,
    userCanonical: indexStatus?.userCanonical,
    lastCrawlTime: indexStatus?.lastCrawlTime,
  }
}

async function inspectUrl(searchconsole: any, siteUrl: string, url: string) {
  try {
    const response = await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: url,
        siteUrl,
        languageCode: 'en-US',
      },
    })

    return summarize(response.data, url)
  } catch (error: any) {
    return {
      url,
      error: error?.response?.data?.error?.message || error?.message || 'Unknown inspection error',
    } satisfies InspectResult
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printHelp()
    return
  }

  const auth = await createAuthClient()
  const searchconsole = google.searchconsole({ version: 'v1', auth }) as any

  let urls = args.urls

  if (urls.length === 0) {
    urls = await fetchSitemapUrls(args.sitemapUrl)
  }

  if (typeof args.limit === 'number' && Number.isFinite(args.limit)) {
    urls = urls.slice(0, args.limit)
  }

  if (urls.length === 0) {
    throw new Error('No URLs to inspect.')
  }

  console.log(`Inspecting ${urls.length} URL(s) for property ${args.siteUrl}`)

  const results: InspectResult[] = []
  for (const [index, url] of urls.entries()) {
    console.log(`[${index + 1}/${urls.length}] ${url}`)
    const result = await inspectUrl(searchconsole, args.siteUrl, url)
    results.push(result)
  }

  const ok = results.filter((item) => !item.error)
  const indexed = ok.filter((item) => item.verdict === 'PASS')
  const notIndexed = ok.filter((item) => item.verdict && item.verdict !== 'PASS')
  const errors = results.filter((item) => item.error)

  const payload = {
    siteUrl: args.siteUrl,
    inspectedAt: new Date().toISOString(),
    totals: {
      urls: results.length,
      indexed: indexed.length,
      notIndexed: notIndexed.length,
      errors: errors.length,
    },
    results,
  }

  if (args.output) {
    await writeFile(args.output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(`Saved report to ${args.output}`)
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  console.log('\nInspection summary')
  console.log(`- Indexed: ${indexed.length}`)
  console.log(`- Not indexed or warning: ${notIndexed.length}`)
  console.log(`- Errors: ${errors.length}`)

  if (notIndexed.length > 0) {
    console.log('\nNeeds attention')
    for (const item of notIndexed.slice(0, 20)) {
      console.log(`- ${item.url}`)
      console.log(`  verdict=${item.verdict || 'unknown'} coverage=${item.coverageState || 'unknown'} fetch=${item.pageFetchState || 'unknown'}`)
    }
  }

  if (errors.length > 0) {
    console.log('\nErrors')
    for (const item of errors.slice(0, 20)) {
      console.log(`- ${item.url}`)
      console.log(`  ${item.error}`)
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
