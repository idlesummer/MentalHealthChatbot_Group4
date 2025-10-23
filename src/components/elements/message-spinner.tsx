import { cn } from '@/lib/utils'

export default function MessageSpinner({ 
  className, 
  ...props  
}: React.HTMLAttributes<HTMLDivElement>) {

  return (
    <div
      className={cn(
        'inline-flex items-center leading-none align-middle text-sm', 
        className,
      )}
      {...props}
    >
      <div className={`
        inline-block 
        w-[0.4em] h-[0.4em] mx-[0.1em] 
        rounded-full bg-neutral-400 
        animate-[bouncing_0.6s_infinite_alternate_both]
      `}/>
      <div className={`
        inline-block 
        w-[0.4em] h-[0.4em] mx-[0.1em] 
        rounded-full bg-neutral-400 
        animate-[bouncing_0.6s_infinite_alternate_both]
        [animation-delay:0.2s]
      `}/>
      <div className={`
        inline-block 
        w-[0.4em] h-[0.4em] mx-[0.1em] 
        rounded-full bg-neutral-400 
        animate-[bouncing_0.6s_infinite_alternate_both]
        [animation-delay:0.4s]
      `}/>
      <style jsx global>{`
        @keyframes bouncing {
          to {
            opacity: 0.1;
            transform: translateY(-0.2em);
          }
        }
      `}</style>
    </div>
  )
}
