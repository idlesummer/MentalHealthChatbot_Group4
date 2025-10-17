'use server'

// All functions that call APIs is will be defined here

export async function mockSendMessage(message: string) {
  // Simulate network or processing delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock bot reply
  const botReplies = [
    'Got it!',
    'That\'s interesting.',
    'Can you tell me more?',
    'Hmm, I see what you mean.',
    'Let\'s think about that together.',
  ]

  const index = Math.floor(Math.random() * botReplies.length)
  const reply = botReplies[index]
  return { reply }
}
