// Product type definitions
export type ProductType = 'new' | 'used'

// Condition rating definitions for used products
export type ConditionRating = 'mint' | 'excellent' | 'very-good' | 'good' | 'fair'

// Condition descriptions for tooltips
export const CONDITION_DESCRIPTIONS: Record<ConditionRating, string> = {
  'mint': 'Mint items are in essentially new original condition but have been opened or played.',
  'excellent': 'Excellent items are almost entirely free from blemishes and other visual defects and have been played or used with the utmost care.',
  'very-good': 'Very Good items may show a few slight marks or scratches but are fully functional and in overall great shape.',
  'good': 'Good items show moderate wear but are fully functional.',
  'fair': 'Fair condition gear should function but will show noticeable cosmetic damage or other issues.'
}

// Condition display labels
export const CONDITION_LABELS: Record<ConditionRating, string> = {
  'mint': 'Mint',
  'excellent': 'Excellent',
  'very-good': 'Very Good',
  'good': 'Good',
  'fair': 'Fair'
}

// Helper function to get condition display text
export function getConditionDisplay(condition: ConditionRating): string {
  return CONDITION_LABELS[condition] || condition
}

// Helper function to get condition description
export function getConditionDescription(condition: ConditionRating): string {
  return CONDITION_DESCRIPTIONS[condition] || ''
}

// Validate product type
export function isValidProductType(type: string): type is ProductType {
  return type === 'new' || type === 'used'
}

// Validate condition rating
export function isValidCondition(condition: string): condition is ConditionRating {
  return ['mint', 'excellent', 'very-good', 'good', 'fair'].includes(condition)
}
