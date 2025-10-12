'use client'

import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'

type MailItem = {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

export interface ChatlistSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  activeItem: NavItem
  mails: MailItem[]
}

export function ChatlistSidebar({ activeItem, mails, ...props }: ChatlistSidebarProps) {
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-base font-medium text-foreground">
            {activeItem?.title}
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Search chats..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {mails.map((mail) => (
              <Link
                href="#"
                key={mail.email}
                className="
                  flex flex-col items-start gap-2 p-4 
                  text-sm leading-tight border-b 
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground whitespace-nowrap last:border-b-0
                "
              >
                <div className="flex items-center w-full gap-2">
                  <span className="font-medium">{mail.name}</span>
                  <span className="ml-auto text-xs">{mail.date}</span>
                </div>
                <span className="line-clamp-2 w-[260px] text-s whitespace-break-spaces">
                  {mail.teaser}
                </span>
              </Link>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
