import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export type DeleteAlertDialogProps = ComponentProps<typeof AlertDialogTrigger> & {
  title?: string
  desc?: string
  icon?: LucideIcon
  onDelete?: () => void
}

export function DeleteAlertDialog({ title, desc, icon, onDelete, children, ...props }: DeleteAlertDialogProps) {
  const Icon = icon ?? Trash2
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild {...props}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="cursor-pointer" onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
