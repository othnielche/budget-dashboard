import React, { useContext } from 'react'
import {
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem, 
    SidebarMenuSubItem,
    SidebarMenuSubButton, 
    SidebarMenuSub, 
    SidebarMenuButton,  
    SidebarGroup, 
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"

import { Calendar, Home, Inbox, Search, Settings, BookCheck, Users, HandCoins, Group } from "lucide-react"
import { AuthContext } from '@/contexts/authContext'
import ROLES from '@/lib/role'
import items from '@/lib/items'


const user1 = {
    name: "Othniel",
    role: "Administrator",
}

export function AppSidebar({ onItemClick }) {
    const { user } = useContext(AuthContext);
    const roleCode = user.roleCode;
    console.log('ROLES:', ROLES);
    console.log('roleCode:', roleCode);
    
    const filteredItems = items.filter((item) => {
        const userPermissions = ROLES[roleCode].permissions;
        const itemPermissions = item.permission;
        const subItemPermissions = item.items?.flatMap((subItem) => subItem.permission) || [];
      
        // Filter sub-menu items based on user permissions
        const filteredSubItems = item.items?.filter((subItem) => {
          return !subItem.permission || subItem.permission.some((permission) => userPermissions.includes(permission));
        });
      
        // Update the item with the filtered sub-menu items
        item.items = filteredSubItems;
      
        // Return true if the item or any of its sub-items have permissions that match the user's permissions
        return itemPermissions.some((permission) => userPermissions.includes(permission)) || filteredSubItems?.length > 0;
      })
  return (
    <div className="">
    <Sidebar> 
        <SidebarHeader>
            CDC BUDGET APPLICATION {user1.role} Dashboard
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Budget Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} onClick={() => onItemClick(item)}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.items && item.items.length > 0 && (
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                            <a href={subItem.url} onClick={() => onItemClick(subItem)}>
                                <span>{subItem.title}</span>
                            </a>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
9o        </SidebarFooter>
      </Sidebar>
    </div>
  ) 
}

export default AppSidebar