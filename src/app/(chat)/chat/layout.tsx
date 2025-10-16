export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-screen bg-muted p-4">
      {children}
    </div>
  )
}
