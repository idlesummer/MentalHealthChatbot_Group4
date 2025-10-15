import { cn } from '@/lib/utils'

export function TypographyH1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn('scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl', className)}
      {...props}
    />
  )
}

export function TypographyP({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('leading-7 text-muted-foreground', className)}
      {...props}
    />
  )
}
