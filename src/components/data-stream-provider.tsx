// TODO: implement data streaming context later
export function DataStreamProvider({ children }: React.PropsWithChildren) {
  return (
    <>
      {children}
    </>
  )
}

// TODO: hook not yet implemented
export function useDataStream() {
  return {
    dataStream: [],
    setDataStream: () => {},
  }
}
