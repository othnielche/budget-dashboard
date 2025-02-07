import { BookCheck, Inbox, Search, Settings, HandCoins, Group, Calendar, Home, Users,  } from "lucide-react"

const items = [
    {
        title: "Budgets", 
        url: "#",
        icon: BookCheck,
        permission: ['view:budgets', ''],
        items: [
            {
                title: "Create New Budget",
                url: "#",
                permission: ['create:budgets']

            },
            {
                title: "View Budgets",
                url: "#",
                permission: ['view:budgets'],
            }
        ]
    }, 
    {
        title: "Requisitions",
        url: "#",
        icon: Inbox,
        permission: ['view:requisitions'],
        items: [
            {
                title: "Create New Requisition",
                url: "#",
                permission: ['create:requisitions'],
            },
            {
                title: "View Requisitions",
                url: "#",
                permission: ['view:requisitions'],
            },
        ]
    },
    { 
        title: "Local Purchase Orders",
        url: "#",
        icon: HandCoins,
        permission: ['view:LPOs'],
        items: [
            {
                title: "Create New LPO",
                url: "#",
                permission: ['create:LPOs', 'view:forwarded-requisitions'],
            },
            {
                title: "View LPOs",
                url: "#",
                permission: ['view:LPOs'],
            },
        ]
    }, 
    {
        title: "Reports",
        url: "#",
        icon: Search,
        permission: ['view:reports'],
        items: [
            {
                title: "View LPO Reports",
                url: "#",
                permission: ['view:LPO-reports'],
            }, 
            {
                title: "View Expenditure Reports",
                url: "#",
                permission: ['view:expenditure-reports'],
            }
        ]
    },
    {
      title: "Groups", 
      url: "#",
      icon: Group,
      permission: ['manage:groups'],
      items: [
          {
              title: "Create New Group",
              url: "#",
              permission: ['manage:groups'],
          },
          {
              title: "View Groups",
              url: "#",
              permission: ['manage:groups'],
          }
      ]
    },
    {
      title: "Estates",
      url: "#",
      icon: Home,
      permission: ['manage:estates'],
      items: [
          {
              title: "Create New Estate",
              url: "#",
              permission: ['manage:estates'],
          },
          {
              title: "View Estates",
              url: "#",
              permission: ['manage:estates'],
          }
      ]
    },
    {
        title: "Cost Centers",
        url: "#",
        icon: Calendar,
        permission: ['manage:cost-centers'],
        items: [
            {
                title: "Create New Cost Center",
                url: "#",
                permission: ['manage:cost-centers'],
            },
            {
                title: "View Cost Centers",
                url: "#",
                permission: ['manage:cost-centers'],
            }
        ]
    },
    {
      title: "Cost Units",
      url: "#",
      icon: Calendar,
      permission: ['manage:cost-centers'],
      items: [
          {
              title: "Create New Cost Unit",
              url: "#",
              permission: ['manage:cost-units'],
          },
          {
              title: "View Cost Units",
              url: "#",
              permission: ['manage:cost-units'],
          }
      ]
    },
    {
        title: "Roles",
        url: "#",
        icon: Settings,
        permission: ['manage:roles'],
        items: [
            {
                title: "Create New Role",
                url: "#",
                permission: ['manage:roles'],
            }, 
            {
                title: "View Roles",
                url: "#",
                permission: ['manage:roles'],
            }
        ]
    },    
    {
        title: "Manage Users",
        url: "#",
        icon: Users,
        permission: ['manage:users'],
        items: [
            {
                title: "Create New User",
                url: "#",
                permission: ['manage:users'],
            }, 
            {
                title: "View Users",
                url: "#",
                permission: ['manage:users'],
            },
            {
                title: "Password Reset Requests",
                url: "#",
                permission: ['manage:users'],
            }
        ]
    }, 
]

export default items