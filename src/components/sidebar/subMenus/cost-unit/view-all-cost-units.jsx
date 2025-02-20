// src/components/sidebar/subMenus/estates/view-all-estates.jsx
import React, { useState, useContext, useEffect } from 'react';
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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Pencil, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


function ViewAllCostUnits() {
  const { user } = useContext(AuthContext);
  const [costUnits, setCostUnits] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [costUnitToEdit, setCostUnitToEdit] = useState(null)
  const [costUnitToDelete, setCostUnitToDelete] = useState(null)
  const [editedCostUnitCode, setEditedCostUnitCode] = useState('');
  const [editedCostUnitName, setEditedCostUnitName] = useState('');
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleEditCostUnit = (id) => {
    const costUnit = costUnits.find((costUnit) => costUnit.CostUnitID === id);
    setCostUnitToEdit(costUnit);
    setEditedCostUnitCode(costUnit.CostUnitCode);
    setEditedCostUnitName(costUnit.CostUnitName);
    setOpenEditDialog(true);
  };

  useEffect(() => {
    const fetchCostUnit = async () => {
      setLoading(true);
      try {
        const response = await API.get("/cost-unit/get-all-cost-units", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        if (data.success) {
          setCostUnits(data.costUnits);
        } else {
          console.error('Failed to fetch cost units');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCostUnit();
  }, [user.token]);

  const handleDeletePress = async (costUnit) => {
    try {
      setCostUnitToDelete(costUnit)
      setOpenDeleteDialog(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteCostUnit = async (id) => {
    try {
      const response = await API.delete(`/cost-unit/delete-cost-unit/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.data.success) {
        // Refresh the estates list
        handleRefresh();
      } else {
        console.error('Failed to delete cost unit');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateCostUnit = async () => {
    try {
      const response = await API.put(`/cost-unit/update-cost-unit/${costUnitToEdit.CostUnitID}`, {
        CostUnitCode: editedCostUnitCode,
        CostUnitName: editedCostUnitName,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });
      if (response.data.success) {
        setFeedbackMessage('Cost Unit updated successfully!');
        setOpenFeedbackDialog(true);
        handleRefresh();
      } else {
        setFeedbackMessage('Failed to update cost unit. Please try again.');
        setOpenFeedbackDialog(true);
      }
    } catch (error) {
      setFeedbackMessage('Failed to update cost unit. Please try again.');
      setOpenFeedbackDialog(true);
    }
  };

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const response = await API.get("/cost-center/get-all-cost-centers", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        console.log('Response:',response)
        const data = response.data;
        console.log('data:', data)
        setCostCenters(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCostCenters();
  }, [user.token]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await API.get("/cost-unit/get-all-cost-units", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      });
      const data = response.data;
      if (data.success) {
        setCostUnits(data.costUnits);
      } else {
        console.error('Failed to fetch cost units:', data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col '>
        <div className='flex flex-row font-medium text-xl mt-10'>
          {/* <text className='tex'> View All Estates</text> */}
          <div className='text-right'>
            <Button className="" variant="" onClick={handleRefresh} disabled={loading}>
              <RefreshCcw className="mr-1 h-4 w-4" />
              {loading ? 'Refreshing...' : 'Refresh'} 
            </Button>
          </div>
        </div>
      <div className=''>
        <div className='flex  mt-4'>
          <Table>
            <TableCaption>Cost Units</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Unit ID</TableHead>
                <TableHead className="font-medium">Cost Unit Code</TableHead>
                <TableHead className='text-right'>Cost Unit Name</TableHead>
                <TableHead className='text-right'>Cost Center</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                costUnits.map((costUnit) => (
                  <TableRow key={costUnit.CostUnitID}>
                    <TableCell>{costUnit.CostUnitID}</TableCell>
                    <TableCell className="font-medium">{costUnit.CostUnitCode}</TableCell>
                    <TableCell className="text-right">{costUnit.CostUnitName}</TableCell>
                    <TableCell className="text-right">
                      {costCenters.find((costCenter) => costCenter.CostCenterID === costUnit.CostUnitID)?.CostCenterCode}
                    </TableCell>
                    <TableCell className="flex justify-end">
                      <TooltipProvider> 
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              className="mr-2"
                              variant="outline"
                              onClick={() => handleEditCostUnit(costUnit.CostUnitID)}
                            ><Pencil />   
                            </Button>                            
                          </TooltipTrigger>
                          <TooltipContent>
                            Edit
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button 
                              variant="outline"
                              onClick={() => handleDeletePress(costUnit)}
                            > <Trash2 />  
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Delete
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <AlertDialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Cost Unit</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            
              <div className="flex flex-col">
                <Label htmlFor="editedEstateCode">Cost Unit Code</Label>
                <Input
                  id="editedCostUnitCode"
                  type="text"
                  value={editedCostUnitCode}
                  onChange={(e) => setEditedCostUnitCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col mt-4">
                <Label htmlFor="editedEstateName">Cost Unit Name</Label>
                <Input
                  id="editedCostUnitName"
                  type="text"
                  value={editedCostUnitName}
                  onChange={(e) => setEditedCostUnitName(e.target.value)}
                />
              </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="primary" onClick={handleUpdateCostUnit}>Update</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FeedBack Dialog */}
      <AlertDialog open={openFeedbackDialog} onOpenChange={setOpenFeedbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feedback</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {feedbackMessage}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button variant="outline" onClick={() => setOpenFeedbackDialog(false)}>OK</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cost Unit</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
          {costUnitToDelete && (
            <div>
              Are you sure you want to delete this cost unit, with Code: {costUnitToDelete.CostUnitCode} and Name: {costUnitToDelete.CostUnitName}?
            </div>
          )}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive"  onClick={() => handleDeleteCostUnit(costUnitToDelete.CostUnitID)}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewAllCostUnits;