import {React, useState} from 'react';

import AppSidebar from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ContentArea from '@/components/content-area';

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
                </SidebarProvider>
            </div>
            <div className="flex-1 flex-col pl-4 overflow-y-auto">
                <div className='flex flex-row'>
                    <div className='flex-1 pt-1 flex-row h-10 text-xl font-semibold self-center text-left fixed top-0'>{activeItem?.title}</div>
                    {/* Make div ocupy the remainder of the available viewport height and width*/ }
                </div>
                <div className='h-full w-full flex-grow bg-' >
                    <ContentArea activeItem={activeItem} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard