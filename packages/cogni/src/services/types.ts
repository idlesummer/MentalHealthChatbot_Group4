/** A message in the conversation */
export interface Message {
  id: string
  user: string  // 'You' or assistant name
  text: string
  ts: number    // Timestamp
}
