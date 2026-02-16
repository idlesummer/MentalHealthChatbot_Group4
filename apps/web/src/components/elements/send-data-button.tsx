import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { sendDataSMTP } from '@/app/(chat)/chat/actions'
import { useSessionDataStore } from '@/lib/store/session-data'
import { useState } from 'react'

export function SendSessionButton() {
  const records = useSessionDataStore(s => s.records)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!name.trim()) {
      alert('Please enter your name')
      return
    }

    if (!records.length) {
      alert('No session data to send')
      return
    }
    try {
      setLoading(true)
      await sendDataSMTP({
        exportedBy: name.trim(),
        exportedAt: new Date().toISOString(),
        records,
      })
      alert('Session sent successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to send session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="border rounded px-2 py-1 text-sm"
      />
      <Button
        variant="outline"
        onClick={handleSend}
        className="gap-2"
        disabled={loading}
      >
        <Send className="h-4 w-4" />
        {loading ? 'Sending…' : 'Send'}
      </Button>
    </div>
  )
}