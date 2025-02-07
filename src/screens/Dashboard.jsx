import {React, useState} from 'react';

import AppSidebar from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ContentArea from '@/components/content-area';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Dashboard() {
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <div className="flex h-screen">
            <div>
                <SidebarProvider>
                    <AppSidebar onItemClick={handleItemClick} />
                        <SidebarTrigger></SidebarTrigger>
                </SidebarProvider>
            </div>
            <div className="flex-1 flex-col pl-4 overflow-y-auto">
                <header >
                    <div className='flex flex-row'>
                        <div className='flex-1 pt-1 flex-row h-10 text-xl font-semibold self-center text-left  top-0'>{activeItem?.title}</div>
                        {/* Make div ocupy the remainder of the available viewport height and width*/ }
                    </div>
                </header>
                <ScrollArea>
                    <div className='h-full w-full flex-grow bg-' >
                        <ContentArea activeItem={activeItem} />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Dashboard