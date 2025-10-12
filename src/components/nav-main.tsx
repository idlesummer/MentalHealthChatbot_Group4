'use client'

import * as React from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import { Command } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive: boolean
}

type MailItem = {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}

type User = {
  name: string
  email: string
  avatar: string
}

export interface NavMainProps
  extends React.ComponentProps<typeof Sidebar> {
  data: {
    user: User
    navMain: NavItem[]
    mails: MailItem[]
  }
  activeItem: NavItem
  setActiveItem: React.Dispatch<React.SetStateAction<NavItem>>
  setMails: React.Dispatch<React.SetStateAction<MailItem[]>>
}

export function NavMain({ data, activeItem, setActiveItem, setMails, ...props }: NavMainProps) {
  return (
    <Sidebar collapsible="none" className="w-auto border-r" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-auto p-0">
              <Link href="#">
                <Avatar className="flex items-center justify-center rounded-lg bg-black text-white">
                  <Command className="size-4" />
                </Avatar>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{ children: item.title, hidden: false }}
                    onClick={() => {
                      setActiveItem(item)
                      const mails = data.mails.sort(() => Math.random() - 0.5)
                      const randomMails = mails.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1))
                      setMails(randomMails)
                    }}
                    isActive={activeItem?.title === item.title}
                  >
                    <item.icon />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
