export default function ChatPage() {
  return (
    <main className="flex flex-col flex-1 gap-4 p-4">
      {Array.from({ length: 24 }).map((_, index) => (
        <div
          key={index}
          className="w-full h-12 rounded-lg bg-muted/50 aspect-video"
        />
      ))}
    </main>
  )
}
