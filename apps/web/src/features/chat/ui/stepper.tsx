// stepper.tsx
'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useState, useEffect, ComponentProps } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

type StepperContextType = {
  currentStep: number
  nextStep: () => void
  prevStep: () => void
  setStep: (step: number | string) => void
  isFirst: boolean
  isLast: boolean
  steps: string[]
}

const StepperContext = createContext<StepperContextType | null>(null)
export function useStepper() {
  const context = useContext(StepperContext)
  if (!context) throw new Error('useStepper must be used within a StepperProvider')
  return context
}

export type StepperProviderProps = {
  steps: string[]
  initialStep?: number
  step?: number
  children: ReactNode
}

export function StepperProvider({ steps, initialStep=0, step: controlledStep, children }: StepperProviderProps) {
  const [currentStep, setCurrentStep] = useState(controlledStep ?? initialStep)

  useEffect(() => {
    if (controlledStep !== undefined) setCurrentStep(controlledStep)
  }, [controlledStep])

  return (
    <StepperContext.Provider value={{
      currentStep,
      steps,
      nextStep: () => setCurrentStep(s => Math.min(s + 1, steps.length - 1)),
      prevStep: () => setCurrentStep(s => Math.max(s - 1, 0)),
      setStep: (step) => setCurrentStep(typeof step === 'string' ? steps.indexOf(step) : step),
      isFirst: currentStep === 0,
      isLast: currentStep === steps.length - 1,
    }}>
      {children}
    </StepperContext.Provider>
  )
}

export type StepperProps = ComponentProps<typeof Breadcrumb>
export function Stepper({ className, ...props }: StepperProps) {
  const { steps, currentStep } = useStepper()

  return (
    <Breadcrumb className={cn('px-4 py-2 border rounded-4xl', className)} {...props}>
      <BreadcrumbList>
        {steps.map((step, i) => (
          <div key={step} className="contents">
            <BreadcrumbItem>
              <BreadcrumbPage className={cn(
                'font-medium transition-colors duration-300 select-none',
                i === currentStep ? 'underline text-accent/75 brightness-75' : 'text-muted-foreground',
              )}>
                {step}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {i < steps.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
