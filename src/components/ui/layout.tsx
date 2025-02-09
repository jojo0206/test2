import React from 'react'
import { SideBar } from './sidebar'

export function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="grid min-h-screen w-full grid-cols-[280px_1fr]">
        <SideBar/>
        {children}
    </div>
  )
}