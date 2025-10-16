export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="w-screen h-screen bg-muted p-4">
      {children}
    </div>
  )
}
