import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TypographyH1, TypographyP } from '@/components/ui/typography'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-6">
      <TypographyH1>404 - Page Not Found</TypographyH1>
      <TypographyP className="text-muted-foreground max-w-md">
        Sorry, the page you’re looking for doesn’t exist or may have been moved.
      </TypographyP>
      <Button asChild>
        <Link href="/">Go back to Home</Link>
      </Button>
    </div>
  )
}
