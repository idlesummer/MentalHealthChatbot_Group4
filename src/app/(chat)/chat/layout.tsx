export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-screen bg-muted overflow-hidden p-4">
      {children}
    </div>
  )
}
