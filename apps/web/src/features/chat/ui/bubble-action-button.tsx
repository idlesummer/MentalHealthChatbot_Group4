'use client'

import type { ComponentProps } from 'react'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type BubbleActionButtonProps = ComponentProps<typeof Button>
export function BubbleActionButton({ className, ...props }: BubbleActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn('rounded-lg text-muted-foreground cursor-pointer', className)}
      {...props}
    />
  )
}

export type BubbleCopyButtonProps = BubbleActionButtonProps & {
  value: string
}

export function BubbleCopyButton({ value, ...props }: BubbleCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const handleClick = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BubbleActionButton onClick={handleClick} {...props}>
      {copied ? <Check/> : <Copy/>}
    </BubbleActionButton>
  )
}
