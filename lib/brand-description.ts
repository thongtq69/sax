import { generateSlug } from '@/lib/slug-utils'

const BRAND_DESCRIPTION_TEMPLATES: Record<string, string> = {
  yamaha:
    'Yamaha is known for precise intonation, durable build quality, and a balanced tonal profile trusted by students, professionals, and studio players worldwide.',
  yanagisawa:
    'Yanagisawa is a premium Japanese saxophone maker celebrated for refined mechanics, fast key action, and an elegant, focused sound preferred by serious players.',
  selmer:
    'Selmer Paris represents classic French saxophone craftsmanship with rich character, expressive response, and long-standing popularity among jazz and classical musicians.',
  keilwerth:
    'Keilwerth saxophones are valued for broad projection, dark core tone, and robust German construction built for players who want a powerful voice.',
  cannonball:
    'Cannonball offers modern saxophone designs with bold finishes, flexible response, and player-focused ergonomics suited for contemporary performance styles.',
  jupiter:
    'Jupiter instruments deliver dependable mechanics and approachable playability, making them a practical choice for developing musicians and educational settings.',
  buffet:
    'Buffet Crampon combines French heritage and precision engineering, producing instruments with nuanced response and a warm, centered tonal character.',
}

export function getBrandDescriptionTemplate(name: string): string | undefined {
  const slug = generateSlug(name || '')
  return BRAND_DESCRIPTION_TEMPLATES[slug]
}

export function getAllBrandDescriptionTemplates() {
  return BRAND_DESCRIPTION_TEMPLATES
}
