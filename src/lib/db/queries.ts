export type DbMessage = { 
  id: string
  from: string
  text: string
  ts: number 
}

const FAKE_ROWS: DbMessage[] = [
  { id: '1',  from: 'Pebble', text: 'Hi there! I\'m Pebble, your mental health companion 🌱 How are you feeling today?', ts: 1760490000000 },
  { id: '2',  from: 'You',    text: 'Hey Pebble. Honestly, I\'ve been feeling really stressed lately.', ts: 1760490060000 },
  { id: '3',  from: 'Pebble', text: 'I\'m really glad you reached out. Stress can be heavy — what\'s been weighing on your mind the most?', ts: 1760490120000 },
  { id: '4',  from: 'You',    text: 'Mostly school and deadlines. It feels like everything\'s piling up.', ts: 1760490180000 },
  { id: '5',  from: 'Pebble', text: 'That sounds overwhelming 😔 When things stack up like that, our minds can feel cluttered. Have you had any breaks recently?', ts: 1760490240000 },
  { id: '6',  from: 'You',    text: 'Not really. I just keep pushing through, even when I\'m exhausted.', ts: 1760490300000 },
  { id: '7',  from: 'Pebble', text: 'That takes a lot of strength. Sometimes resting isn\'t giving up — it\'s recharging so you can keep going. What helps you relax, even a little?', ts: 1760490360000 },
  { id: '8',  from: 'You',    text: 'I usually listen to music or draw when I can.', ts: 1760490420000 },
  { id: '9',  from: 'Pebble', text: 'Those are wonderful outlets 🎨🎧 Creative expression can really help release built-up tension. What kind of music do you turn to when you\'re stressed?', ts: 1760490480000 },
  { id: '10', from: 'You',    text: 'Mostly calm instrumentals or lofi. It helps me focus.', ts: 1760490540000 },
  { id: '11', from: 'Pebble', text: 'That\'s a great choice. Music like that can help slow your breathing and calm your thoughts. Would you like to try a short grounding exercise together?', ts: 1760490600000 },
  { id: '12', from: 'You',    text: 'Sure, I\'d like that.', ts: 1760490660000 },
  { id: '13', from: 'Pebble', text: 'Alright 🌿 Try to notice your breathing. Inhale deeply through your nose… hold for a moment… and exhale slowly through your mouth. Let your shoulders relax as you do.', ts: 1760490720000 },
  { id: '14', from: 'You',    text: 'That actually helped a bit.', ts: 1760490840000 },
  { id: '15', from: 'Pebble', text: 'I\'m really glad to hear that 😊 Sometimes small moments of calm can remind us that we can still find peace, even in busy times.', ts: 1760490900000 },
  { id: '16', from: 'You',    text: 'Yeah… I guess I just forget to pause sometimes.', ts: 1760490960000 },
  { id: '17', from: 'Pebble', text: 'That\'s completely normal. You\'re doing your best — and that\'s enough. Maybe we can set a tiny reminder for short breaks during your study sessions?', ts: 1760491020000 },
  { id: '18', from: 'You',    text: 'That might actually help me a lot.', ts: 1760491080000 },
  { id: '19', from: 'Pebble', text: 'Great! Try starting with a 5-minute pause every hour — stretch, breathe, hydrate. You\'ll be surprised how much it helps your focus.', ts: 1760491140000 },
  { id: '20', from: 'You',    text: 'Thanks, Pebble. I feel lighter after talking with you.', ts: 1760491200000 },
]

export async function fetchMessages(opts?: { limit?: number; beforeTs?: number }) {
  const { limit = 20, beforeTs } = opts ?? {}

  // Simulate network latency
  await new Promise(r => setTimeout(r, 500))

  let rows = FAKE_ROWS
  if (beforeTs) rows = rows.filter(m => m.ts < beforeTs)
  rows = rows.sort((a, b) => a.ts - b.ts) // stable order coming from "DB"

  return rows.slice(-limit) // last N
}
