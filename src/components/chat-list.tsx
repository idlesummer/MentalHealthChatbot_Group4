'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { TypographyH3 } from '@/components/ui/typography'

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

export interface ChatListProps
  extends React.ComponentProps<typeof Sidebar> {
  activeItem: NavItem
  mails: MailItem[]
}

export function ChatList({ activeItem, mails, ...props }: ChatListProps) {
  return (
    <Sidebar collapsible="none" className="bg-background" {...props}>
      <SidebarHeader className="space-y-2 p-6">
        <ChatListHeader title={activeItem?.title} />  
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {mails.map(mail => <ChatListItem key={mail.email} mail={mail} />)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function ChatListHeader({ title }: { title: string }) {
  return (
    <>
      <div className="flex items-center justify-between w-full">
        <TypographyH3 className="font-medium text-foreground">
          {title}
        </TypographyH3>
      </div>
      <SidebarInput placeholder="Search chats..." />
    </>
  )
}

function ChatListItem({ mail }: { mail: MailItem }) {
  return (
    <Link href="/chat/some-user-id" className="
      flex items-center gap-3 p-4
      text-sm leading-snug
      hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
      last:border-b-0
    ">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage 
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${mail.name}`} 
          alt={mail.name} 
        />
        <AvatarFallback>{mail.name[0]}</AvatarFallback>
      </Avatar>

      {/* Text Content */}
      <div>
        <div className="flex items-center w-full gap-2">
          <span className="font-medium">{mail.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {mail.date}
          </span>
        </div>
        <span className="
          w-auto text-s text-muted-foreground 
          line-clamp-1 whitespace-break-spaces
        ">
          {mail.teaser}
        </span>
      </div>
    </Link>
  )
}
