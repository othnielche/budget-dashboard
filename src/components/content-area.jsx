import { AuthContext } from '@/contexts/authContext';
import React, {useContext} from 'react';

function ContentArea({ activeItem }) {
    const {user} = useContext(AuthContext)
    if (!activeItem) return <div>No item selected</div>;

    switch (activeItem.title) {
        case 'Budgets':
            return <div className=' '>This is the Budgets</div>;
        case 'Create New Budget':
            return <div>This is the Create New Budget</div>;
        case 'Create New Requisition':
            return <div>This is the Create New Requisition</div>;
        case 'View Requisitions':
            return <div>This is View Requisitions</div>;
        case 'Local Purchase Order':
            return <div>This is Local Purchase Order</div>;
        case 'View LPO Reports':
            return <div>This is View LPO Reports</div>;
        case 'View Expenditure Reports':
            return <div>This is View Expenditure Reports</div>;
        case 'Reports':
            return <div>This is Reports</div>;
        case 'Groups':
            return <div>This is Groups</div>;
        case 'Create New Group':
            return <div>This is Create New Group</div>;
        case 'View Groups':
            return <div>This is View Groups</div>;
        case 'Users':
            return <div>This is Users</div>;
        case 'Create New User':
            return <div>This is Create New User</div>;
        case 'View Users':
            return <div>This is View Users</div>;
        case 'Password Reset Requests':
            return <div>This is Password Reset Requests</div>;
        default:
            return <div>Unknown item: {activeItem.title} and {user.estateCode}</div>;
    }
}

export default ContentArea