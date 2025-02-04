import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import React from 'react'

export function Layout({ Children }) {
  return (
    <SidebarProvider>
        <AppSidebar>
            <main>
                <SidebarTrigger />
                {Children}
            </main>
        </AppSidebar>
    </SidebarProvider>
  )
}

export default Layout