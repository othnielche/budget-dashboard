import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

function CreateCostCenter() {
  return (
    <div>
      <form action="">
        <div className='flex flex-col mt-4 ml-2'>
          <div className='flex flex-row'>
            <div className='w-1/4'>
              <Label htmlFor='Matricule'>Cost Center Code</Label>
              <Input id='CostCenterCode' type='text ' placeholder='cost center code' required />
            </div>
            <div className='ml-4 w-1/4'>
              <Label htmlFor='text'>Cost Center Name</Label>
              <Input id='CostCenterName' type='text' placeholder='cost center name' required/>
            </div>
          </div>
          <div className='mt-4 w-1/2'>
            <Button>Create Cost Center</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateCostCenter