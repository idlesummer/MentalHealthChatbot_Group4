import { useCallback, useState } from 'react'

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggler = (next?: boolean) => setValue(v => next ?? !v)
  const toggle = useCallback(toggler, [])
  return [value, toggle]
}
