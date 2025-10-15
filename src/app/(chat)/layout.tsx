import { CSSProperties } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'


export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider style={{ '--sidebar-width': '420px' } as CSSProperties}>
      <AppSidebar />
      <SidebarInset className="h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
