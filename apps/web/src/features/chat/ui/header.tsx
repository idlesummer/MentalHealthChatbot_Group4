import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from './avatar'

export type HeaderProps = ComponentProps<'div'>
export function Header({ className, ...props }: HeaderProps) {
  return <div className={cn('z-1 relative border-x w-full max-w-7xl', className)} {...props} />
}

export type HeaderGroupProps = ComponentProps<'div'>
export function HeaderGroup({ className, ...props }: HeaderGroupProps) {
  return (
    <div
      data-slot="chat-header-group"
      className={cn(
        'flex flex-col gap-4',
        'bg-muted shadow-2xs',
        'px-10 py-4',
        'rounded-b-xl',
        className,
      )}
      {...props}
    />
  )
}

export type HeaderRowProps = ComponentProps<'div'>
export function HeaderRow({ className, ...props }: HeaderRowProps) {
  return <div className={cn('flex justify-center items-center gap-6', className)} {...props} />
}

export type HeaderAvatarProps = ComponentProps<typeof Avatar>
export function HeaderAvatar({ className, ...props }: HeaderAvatarProps) {
  return <Avatar size='lg' {...props} />
}

export type HeaderInfoProps = ComponentProps<'div'> & {
  name?: string
  status?: string
}

export function HeaderInfo({ name, status, className, ...props }: HeaderInfoProps) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {name && <span className="font-semibold text-md" {...props}>{name}</span>}
      {status && <span className="text-muted-foreground text-sm" {...props}>{status}</span>}
    </div>
  )
}
