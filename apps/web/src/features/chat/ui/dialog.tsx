import type { ComponentProps, PropsWithChildren } from 'react'
import type {  LucideIcon } from 'lucide-react'
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ToolbarButton } from './header-toolbar'

export type DialogButtonProps = PropsWithChildren<ComponentProps<typeof ToolbarButton>> & {
  icon?: LucideIcon
}
export function DialogButton({ icon, children, ...props }: DialogButtonProps) {
  const Icon = icon ?? EllipsisVertical
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ToolbarButton {...props}>
          <Icon />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="data-[slot=dialog-content]:max-w-6xl h-200">
        <DialogTitle className="sr-only">Toolbar Dialog</DialogTitle>
        <DialogDescription className="sr-only">Toolbar dialog for additional settings</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export type DialogTabsProps = ComponentProps<typeof Tabs> & {
  tabs: string[]
}
export function DialogTabs({ tabs, defaultValue, children, ...props }: DialogTabsProps) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]} className="flex flex-col gap-6 min-h-0" {...props}>
      <TabsList variant="line">
        {tabs.map(title => (
          <TabsTrigger key={title} value={title}>{title}</TabsTrigger>
        ))}
      </TabsList>
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        {children}
      </div>
    </Tabs>
  )
}

export type DialogTabsContentProps = ComponentProps<typeof TabsContent>
export function DialogTabsContent({ className, ...props }: DialogTabsContentProps) {
  return <TabsContent className={cn('flex flex-col gap-4', className)} {...props} />
}

export type DialogSectionProps = ComponentProps<'div'> & {
  title?: string
  border?: boolean
}
export function DialogSection({ title, border=true, children, className, ...props }: DialogSectionProps) {
  return (
    <div className={cn('flex flex-col gap-px px-2', border && 'border-t', className)} {...props}>
      {title && <span className="py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">{title}</span>}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

export type DialogRowProps = ComponentProps<'div'> & {
  label?: string
  desc?: string
}
export function DialogRow({ label, desc, children, className, ...props }: DialogRowProps) {
  return (
    <div className={cn('flex justify-between items-center', className)} {...props}>
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        {desc && <span className="text-muted-foreground text-xs">{desc}</span>}
      </div>
      {children}
    </div>
  )
}

export type DialogRowButtonProps = ComponentProps<typeof Button>
export function DialogRowButton({ className, ...props }: DialogRowButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  )
}
