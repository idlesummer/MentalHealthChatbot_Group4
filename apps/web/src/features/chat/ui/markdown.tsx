import type { ComponentProps } from 'react'

const PATTERN = /\*(.+?)\*|_(.+?)_|~(.+?)~|`(.+?)`|(https?:\/\/\S+|www\.\S+|[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?:\/\S*)?)/g

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

function parse(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let match: RegExpExecArray | null
  let i = 0, last = 0

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1])      nodes.push(<strong key={i++}>{match[1]}</strong>)
    else if (match[2]) nodes.push(<em key={i++}>{match[2]}</em>)
    else if (match[3]) nodes.push(<s key={i++}>{match[3]}</s>)
    else if (match[4]) nodes.push(<code key={i++}>{match[4]}</code>)
    else if (match[5]) nodes.push(<a key={i++} href={normalizeUrl(match[5])} className="underline">{match[5]}</a>)
    last = match.index + match[0].length
  }

  if (last < text.length)
    nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ className, children, ...props }: ComponentProps<'span'>) {
  return typeof children === 'string'
    ? <span className={className} {...props}>{parse(children)}</span>
    : <>{children}</>
}
