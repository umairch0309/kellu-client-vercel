'use client'

import Header from "./common/Header"
import AppSidebar from "./common/Sidebar"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {children}
        </main>
      </div>
    </>
  )
}