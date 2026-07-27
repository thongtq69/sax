import { prisma } from '../lib/prisma'
import { normalizeModels } from '../lib/models'
import { sanitizeEditableHtml } from '../lib/sanitize-html'

const A902_HTML = `
<!-- Yanagisawa A-902 Intro — plain content, sits directly under the page H1, no boxed background -->
<style>
  .jsc-intro {
    font-family: 'DM Sans', sans-serif;
    max-width: 780px;
    margin: 24px 0 40px 0;
  }
  .jsc-intro .jsc-intro-subhead {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 1.3rem;
    color: #4A4636;
    margin: 0 0 16px 0;
  }
  .jsc-intro p {
    font-size: 1.02rem;
    line-height: 1.75;
    color: #3A362F;
    margin: 0 0 16px 0;
  }
  .jsc-intro strong {
    color: #1C1A17;
    font-weight: 600;
  }
  .jsc-intro a {
    color: #1C1A17;
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: #C9A84C;
    text-underline-offset: 2px;
  }
  .jsc-intro a:hover {
    color: #AEA668;
  }
</style>

<div class="jsc-intro">
  <p class="jsc-intro-subhead">The Distinctive Voice of Bronze</p>

  <p>The Yanagisawa A-902 is a professional alto saxophone created for players who want the precision of Yanagisawa with the richer character of a bronze body.</p>

  <p>Its bronze construction gives the A-902 a deep, expressive voice with a warm resonance, while retaining the accurate intonation, responsive keywork, and exceptional craftsmanship for which Yanagisawa is known.</p>

  <p>The A-902 has an important place in the history of Yanagisawa alto saxophones. It introduced many players to the distinctive bronze sound and became the predecessor of the modern A-WO2 bronze alto.</p>

  <p>Players comparing instruments from the same generation may also consider the brass-bodied <a href="https://www.jamessaxcorner.com/p/yanagisawa-a-901-alto-saxophone"><strong>A-901</strong></a>. For those seeking a higher-tier bronze model with a different construction and playing feel, the <a href="https://www.jamessaxcorner.com/p/yanagisawa-a-992-alto-saxophone"><strong>A-992</strong></a> is another important part of Yanagisawa's alto family.</p>

  <p>At James Sax Corner, every A-902 is carefully inspected and professionally prepared before it is offered for sale. Even when no example is currently in stock, this page remains available as a reference for players exploring Yanagisawa's bronze alto saxophones.</p>
</div>
`

async function main() {
  const brand = await prisma.brand.findFirst({
    where: { name: { equals: 'Yanagisawa', mode: 'insensitive' } },
    select: {
      id: true,
      models: true,
      modelPageContent: true,
    },
  })

  if (!brand) {
    throw new Error('Yanagisawa brand not found')
  }

  const currentContent =
    brand.modelPageContent && typeof brand.modelPageContent === 'object' && !Array.isArray(brand.modelPageContent)
      ? (brand.modelPageContent as Record<string, unknown>)
      : {}
  const sanitizedHtml = sanitizeEditableHtml(A902_HTML)

  if (!sanitizedHtml) {
    throw new Error('A-902 introduction was empty after sanitization')
  }

  const models = normalizeModels([...brand.models, 'A-902'])
  const modelPageContent = {
    ...currentContent,
    'a-902': sanitizedHtml,
  }

  await prisma.brand.update({
    where: { id: brand.id },
    data: {
      models,
      modelPageContent,
    },
  })

  const updated = await prisma.brand.findUnique({
    where: { id: brand.id },
    select: {
      models: true,
      modelPageContent: true,
    },
  })
  const updatedContent = (updated?.modelPageContent || {}) as Record<string, unknown>

  if (!updated?.models.includes('A-902') || typeof updatedContent['a-902'] !== 'string') {
    throw new Error('A-902 model verification failed after update')
  }

  console.log('Yanagisawa A-902 model and introduction are ready.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
