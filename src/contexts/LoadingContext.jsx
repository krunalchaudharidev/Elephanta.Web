import { createContext, useContext } from 'react'

const LoadingContext = createContext({ isLoading: false, setLoading: () => {} })

export function useLoading() {
  return useContext(LoadingContext)
}

export default LoadingContext
