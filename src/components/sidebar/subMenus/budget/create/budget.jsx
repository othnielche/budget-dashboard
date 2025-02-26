import React from 'react'
import CreateBudget from './create-budget'
import ImportBudgetLines from './import-budget-lines'
import {    
    Tabs,
    TabsContent, 
    TabsTrigger, 
    TabsList,
} from '@/components/ui/tabs'
import ViewBudgets from '../view/view-budget'


function Budget() {
  return (
    <div className='flex max-w-screen-2xl flex-col'>
        <Tabs defaultValue="createBudget" className="w-full overflow-hidden">
            <TabsList className="grid max-w-lg grid-cols-2">
                <TabsTrigger value="createBudget">Create Budget</TabsTrigger>
                <TabsTrigger value="importBudgetLines">Import Budget Lines</TabsTrigger>
                <TabsTrigger value="viewBudgets">View Budgets</TabsTrigger>
            </TabsList>
            <TabsContent value="createBudget" >
                <CreateBudget />
            </TabsContent>
            <TabsContent value="importBudgetLines">
                <ImportBudgetLines />
            </TabsContent>
            <TabsContent value="viewBudgets">
                <ViewBudgets />
            </TabsContent>
        </Tabs>
    </div>
  )
}

export default  Budget          