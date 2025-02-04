
const ROLES = {
    1: {
        name: "Admin",
        permissions: [
            "manage:users",
            "create:budgets",
            "view:budgets",
            "update:budgets",
            "create:requisitions",
            "view:requisitions",
            "update:requisitions",
            "view:forwarded-requisitions",
            "view:reports",
            "view:LPOs",
            "create:LPOs",
            "create:LPOs",
            "update:LPOs",
            "view:LPO-reports",
            "view:expenditure-reports",
            "manage:estates",
            "manage:groups",
        ],
        scope: "all",
    },
    2: {
        name: "Group Manager",
        permissions: [
            "view:budgets",
            "view:requisitions",
            "update:requisitions",
            "view:reports",
            "view:expenditure-reports",
        ],
        scope: "Group",
    },
    3: {
        name: "Managing Controller",
        permissions: [
            "view:budgets",
            "view:requisitions",
            "update:requisitions",
            "view:reports",
            "view:expenditure-reports",
        ],
        scope: "Group",
    },
    4: {
        name: "Estate Manager",
        permissions: [
            "view:budgets",
            "view:requisitions",
            "update:requisitions",
            "create:requisitions",
            "view:reports",
            "view:expenditure-reports",
        ],
        scope: "Estate",
    },
    5: {
        name: "Supplies Manager",
        permissions: [
            "view:forwarded-requisitions",
            "create:LPOs",
            "update:LPOs",
            "view:LPOs",
            "view:LPO-reports",
        ], 
        scope: "all"
    },
    6: {
        name: "HOMC", 
        permissions: [
            "view:LPOs",
            "update:LPOs",
            "view:LPO-reports",
            "view:reports",
            "view:expenditure-reports",
        ],
        scope: "all"
    }
} 


export default ROLES;

// A group of estates for a group, each state has a group manager and each group has a group manager and managing controller. the numbers in the index represent the rolecodes in the jwt token returned.