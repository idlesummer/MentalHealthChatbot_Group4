/** The 8 CBT intents in order */
export type Intent = keyof typeof INTENT_ROUTE_REGISTRY

// Constants below only used by the intent manager

/** Intent routing registry - defines the progression through CBT stages */
export const INTENT_ROUTE_REGISTRY = {
  I1: 'I2',
  I2: 'I3',
  I3: 'I4',   // after initial rating, proceed to evidence-for
  I4: 'I5',
  I5: 'I6',   // after evidence against, go to alternative thought
  I6: 'I7',   // after alternative thought, go to mood re-rating
  I7: 'I8',
  I8: 'I1',   // cycle complete, restart
} as const

export const INTENTS = Object.keys(INTENT_ROUTE_REGISTRY) as Intent[]

/** Intent completion rules registry */
export const INTENT_COMPLETION_REGISTRY: Record<Intent, string> = {
  I1: 'Complete only if the user described a clear situation or event that triggered distress AND at least one contextual details (e.g., what happened, when or where it occurred, who was involved, or why it mattered). Incomplete if no additional context',
  I2: 'Complete if the user expressed an automatic thought - an immediate, self-referential interpretation or belief that arose from the situation (e.g., \'I\'m not good enough\', \'They must hate me\'). Descriptions of feelings alone do not count.',
  I3: 'Complete if the user described the intensity of their emotional response - either by providing a numeric rating (1-100) or clear qualitative strength (e.g., \'mild\', \'very strong\', \'crushing\').',
  I4: 'Complete if the user has provided an example that supports the user\'s automatic thought.',
  I5: 'Complete if the user has identified at least one example that contradicts or weakens their automatic thought - showing they can recognize exceptions, counterexamples, or alternative explanations.',
  I6: 'Complete if the user articulated a believable, self-compassionate, and more balanced alternative thought that responds to their earlier automatic thought, demonstrating cognitive restructuring.',
  I7: 'Complete if the user described a shift or re-rating of their emotional intensity compared to Step 3 - either explicitly (new number) or implicitly (e.g., \'I feel lighter\', \'still the same\', \'less anxious\').',
  I8: 'Complete if the user acknowledged or agreed to a practical coping strategy they feel willing or able to try, indicating closure of the current CBT cycle.',
} as const
