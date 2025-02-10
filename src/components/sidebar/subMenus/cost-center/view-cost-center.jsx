import React, { useState, useContext, useEffect} from 'react';
import { AuthContext } from '@/contexts/authContext';
import API from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';


function ViewAllCostCenters() {
  const {user} = useContext(AuthContext)
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    const getCostCenters = async () => {
      try {
        const response = await API.get("/cost-center/get-all-cost-centers", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        localStorage.setItem('costCenters', data)
        setCostCenters(data);
      } catch (error) {
        console.error(error);
      }
    };
    getCostCenters();
  }, [user.token]);
  return (
    <div className='flex flex-col'>
      <div>
        <div className='font-medium text-xl mt-10'>
          <text className=''> View All Cost Centers</text>
        </div>
        <div className='flex max-w-screen-xl mt-4'>
          <Table>
            <TableCaption>Cost Centers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Center ID</TableHead>
                <TableHead className="w-[100px]">Cost Center Code</TableHead>
                <TableHead className='text-right'>Cost Center Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costCenters.map((costCenter) => (
                <TableRow>
                  <TableCell>{costCenter.CostCenterID}</TableCell>
                  <TableCell className="font-medium">{costCenter.CostCenterCode}</TableCell>
                  <TableCell className="text-right">{costCenter.CostCenterName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ViewAllCostCenters