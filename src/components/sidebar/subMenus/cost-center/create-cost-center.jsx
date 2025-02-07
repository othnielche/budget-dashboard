import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import API from '@/lib/axios'
import React, {useContext, useState} from 'react'
import { AuthContext } from '@/contexts/authContext'

function CreateCostCenter() {
  const [CostCenterCode, setCostCenterCode] = useState("");
  const [CostCenterName, setCostCenterName] = useState("");
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/cost-center/add-cost-center", {
        CostCenterCode: CostCenterCode,
        CostCenterName: CostCenterName
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      });

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col mt-4 ml-2'>
          <div className='flex flex-row'>
            <div className='w-1/4'>
              <Label htmlFor='Matricule'>Cost Center Code</Label>
              <Input 
                id='CostCenterCode' 
                type='text' 
                placeholder='cost center code'
                value={CostCenterCode} 
                onChange={(e) => setCostCenterCode(e.target.value)} 
                required 
              />
            </div>
            <div className='ml-4 w-1/4'>
              <Label htmlFor='text'>Cost Center Name</Label>
              <Input 
                id='CostCenterName' 
                type='text' 
                value={CostCenterName} 
                onChange={(e) => setCostCenterName(e.target.value)} placeholder='cost center name' 
                required
              />
            </div>
          </div>
          <div className='mt-4 w-1/2'>
            <Button type='submit'>Create Cost Center</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateCostCenter