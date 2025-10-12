import { CSSProperties } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ChatHeader } from '@/components/chat-header'


export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider style={{ '--sidebar-width': '420px' } as CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <ChatHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
