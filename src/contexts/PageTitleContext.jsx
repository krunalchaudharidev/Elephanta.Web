import React, { createContext, useContext, useState } from 'react'

const PageTitleContext = createContext({ title: null, setTitle: () => {} })

export function PageTitleProvider({ children }) {
  const [title, setTitle] = useState(null)
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  return useContext(PageTitleContext)
}

export default PageTitleContext
