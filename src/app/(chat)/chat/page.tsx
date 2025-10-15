import { PingPongLoader } from '@/components/elements/ping-pong-loader'
import { TypographyH3, TypographyMuted } from '@/components/ui/typography'

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <PingPongLoader  />
      <div className="flex flex-col items-center space-y-1">
        <TypographyH3 className="text-muted-foreground">
          Start chatting now 😊
        </TypographyH3>
        <TypographyMuted>
          Pick a chat on the left to begin
        </TypographyMuted>
      </div>
    </div>
  )
}
