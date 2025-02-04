import {React, useState} from 'react';

import AppSidebar from './app-sidebar';
import { SidebarProvider } from './ui/sidebar';
import ContentArea from './content-area';

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
            <div className="flex-1 ">
                <ContentArea activeItem={activeItem} />
            </div>
        </div>
    )
}

export default Dashboard