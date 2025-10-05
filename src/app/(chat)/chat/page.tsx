import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ChatPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-sky-100 p-4">
      <Card className="w-full max-w-sm text-center shadow-lg border-indigo-100">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-indigo-700">
            Hello Raine! 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">This is NextJS</p>
        </CardContent>
      </Card>
    </div>
  )
}
