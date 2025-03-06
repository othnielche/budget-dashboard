import React, { useContext } from 'react'
import { AuthContext } from '@/contexts/authContext'
import ROLES from '@/lib/role';
import BudgetLineAdmin from './budget-line-admin';
import BudgetLineEstateManager from './budget-line-estate-manager';
import BudgetLineGroupManagerMC from './budget-line-group-manager-mc';

function ViewBudgets() {
  const { user } = useContext(AuthContext);
  
  // Determine which component to render based on user role
  const renderBudgetComponent = () => {
    if (!user) {
      return (
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Authentication Required</h3>
          <p>Please log in to view budget information.</p>
        </div>
      );
    }
    
    // Estate Manager (role code 4)
    if (user.roleCode === 4) {
      return <BudgetLineEstateManager />;
    }
    
    // Group Manager or Managing Controller (role codes 2 and 3)
    if ([2, 3].includes(user.roleCode)) {
      return <BudgetLineGroupManagerMC />;
    }
    
    // Admin (role code 1) or other roles with budget view permission
    if (user.roleCode === 1) {
      return <BudgetLineAdmin />;
    }
    
    // User doesn't have permission to view budgets
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold mb-4">Access Denied</h3>
        <p>You don't have permission to view budget information.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    );
  };

  return (
    <div>
      {renderBudgetComponent()}
    </div>
  )
}

export default ViewBudgets