import { AuthContext } from '@/contexts/authContext';
import React, {useContext} from 'react';
import ViewRoles from './sidebar/subMenus/view-roles';
import CreateNewUser from './sidebar/subMenus/users/create-new-user';
ViewRoles
import CreateCostCenter from './sidebar/subMenus/cost-center/create-cost-center';
import CreateCostUnit from './sidebar/subMenus/cost-unit/create-cost-unit';
import ViewAllCostUnits from './sidebar/subMenus/cost-unit/view-all-cost-units';
import ViewAllCostCenters from './sidebar/subMenus/cost-center/view-cost-center';
import ViewAllUsers from './sidebar/subMenus/users/view-all-users';
import CreateEstate from './sidebar/subMenus/estates/create-estate';
import ViewAllEstates from './sidebar/subMenus/estates/view-all-estates';
import ViewAllGroups from './sidebar/subMenus/groups/view-all-groups';
import CreateGroup from './sidebar/subMenus/groups/create-group';
import CreateItem from './sidebar/subMenus/item/create-item';
import Settings from './sidebar/subMenus/Settings/settings';
import ViewAllItems from './sidebar/subMenus/item/view-all-items';
import CreateMeasuringUnit from './sidebar/subMenus/measuring-unit/create-measuring-unit';
import ViewAllMeasuringUnits from './sidebar/subMenus/measuring-unit/view-all-measuring-units';
import Budget from './sidebar/subMenus/budget/create/budget';
import ViewBudgets from './sidebar/subMenus/budget/view/view-budget';
import ViewRequisitions from './requisition/view-requisitions';
function ContentArea({ activeItem }) {
    const {user} = useContext(AuthContext)
    if (!activeItem) return <div>This is the CDC Budget Application</div>;

    switch (activeItem.title) {
        case 'Budgets':
            return (
                <div className='flex flex-col justify-center h-full w-full'>
                    <div className='items-center justify-center h-full w-full'>This is the Budget</div>
                </div>
            )
        case 'Create New Budget':
            return <div><Budget /></div>;
        case 'View Budgets':
            return <div><ViewBudgets /></div>;
        case 'Create New Requisition':
            return <div>This is the Create New Requisition</div>;
        case 'View Requisitions':
            return <div><ViewRequisitions /></div>;
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
            return <div><CreateGroup /></div>;
        case 'View Groups':
            return <div><ViewAllGroups /></div>;
        case 'Estates':
            return <div>This is Estates</div>;
        case 'Create New Estate':
            return <div><CreateEstate /></div>;
        case 'View Estates':
            return <div><ViewAllEstates /></div>;
        case 'Users':
            return <div>This is Users</div>;
        case 'Create New User':
            return <div><CreateNewUser /></div>;
        case 'View Users':
            return <div><ViewAllUsers /></div>;
        case 'Password Reset Requests':
            return <div>This is Password Reset Requests</div>;
        case 'Cost Centers':
            return <div>This is Cost Centers</div>;
        case 'Create New Cost Center':
            return <div><CreateCostCenter /></div>;
        case 'View Cost Centers':
            return <div><ViewAllCostCenters /></div>;
        case 'Cost Units':
            return <div>This is Cost Unit</div>;
        case 'Create New Cost Unit':
            return <div><CreateCostUnit /></div>;
        case 'View Cost Units':
            return <div><ViewAllCostUnits /></div>;
        case 'Roles':
            return <div>This is Roles</div>;
        case 'Create New Role':
            return <div>This is Create New Role</div>;
        case 'View Roles':
            return <div className='items-center justify-center'><ViewRoles /></div>;
        case 'Settings':
            return <div><Settings /></div>;
        case 'Create New Item':
            return <div><CreateItem /></div>;
        case 'View Items':
            return <div><ViewAllItems /></div>;
        case 'Create New Measuring Unit':
            return <div><CreateMeasuringUnit /></div>
        case 'View Measuring Units':
            return <div><ViewAllMeasuringUnits /></div>
        default:
            return <div>Unknown item: {activeItem.title} and {user.estateCode}</div>;
    }
}

export default ContentArea