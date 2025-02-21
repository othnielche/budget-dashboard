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
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Pencil, Trash2, UserRoundPlus, Ruler} from 'lucide-react';

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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


function ViewAllMeasuringUnits() {
  const { user } = useContext(AuthContext);
  const [measuringUnits, setMeasuringUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [measuringUnitToEdit, setMeasuringUnitToEdit] = useState(null);
  const [editedMeasuringUnitName, setEditedMeasuringUnitName] = useState('');
  const [editedMeasuringUnitSymbol, setEditedMeasuringUnitSymbol] = useState('');
  const [measuringUnitToDelete, setMeasuringUnitToDelete] = useState('');
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchMeasuringUnits = async () => {
      setLoading(true);
      try {
        const response = await API.get("/measuring-unit/get-all-measuring-units", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        if (data.success) {
          setMeasuringUnits(data.measuringUnits);
        } else {
          console.error('Failed to fetch measuring units');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeasuringUnits();
  }, [user.token]);

  const handleDeleteMeasuringUnit = async (id) => {
    try {
      const response = await API.delete(`/measuring-unit/delete-measuring-unit/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.data.success) {
        // Refresh the estates list
        handleRefresh();
      } else {
        console.error('Failed to delete estate');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateMeasuringUnit = async () => {
    try {
      const response = await API.put(`/measuring-unit/update-measuring-unit/${measuringUnitToEdit.MeasuringUnitID}`, {
        MeasuringUnitName: (editedMeasuringUnitName).toLocaleLowerCase(),
        MeasuringUnitSymbol: (editedMeasuringUnitSymbol).toLocaleLowerCase(),
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });

      if (response.data.success) {
        setFeedbackMessage('Measuring unit updated successfully!');
        setOpenFeedbackDialog(true);
        handleRefresh();
      } else {
        setFeedbackMessage('Failed to update measuring unit. please try again.');
        setOpenFeedbackDialog(true);
      }
    } catch (error) {
      setFeedbackMessage('Failed to update measuring unit. Please try again')
      setOpenFeedbackDialog(true);
    }
  }

    const handleDeletePress = async (measuringUnit) => {
      try {
        setMeasuringUnitToDelete(measuringUnit);
        setOpenDeleteDialog(true)
      } catch (error) {
        console.error(error)
      }
    }

    const handleRefresh = async () => {
      setLoading(true);
      try {
        const response = await API.get("/measuring-unit/get-all-measuring-units", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
  
        const data = response.data;
        setMeasuringUnits(data.measuringUnits);
  
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    const handleEditMeasuringUnit = (id) => {
      const measuringUnit = measuringUnits.find((measuringUnit) => measuringUnit.MeasuringUnitID === id);
      setMeasuringUnitToEdit(measuringUnit);
      setEditedMeasuringUnitName(measuringUnit.MeasuringUnitName);
      setOpenEditDialog(true);
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
            <Button className="ml-4" variant="" onClick={handleRefresh} disabled={loading}>
              <Ruler className="mr-1 h-4 w-4" />
              Add Measuring Unit 
            </Button>
          </div>
        </div>
      <div className=''>
        <div className='flex  mt-4'>
          <Table>
            <TableCaption>Measuring Units</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Measuring Unit ID</TableHead>
                <TableHead className="font-medium">Measuring Unit Name</TableHead>
                <TableHead className='text-right'>Estate Symbol</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(4).fill(0).map((_, index) => (
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
                  </TableRow>
                ))
              ) : (
                measuringUnits.map((measuringUnit) => (
                  <TableRow key={measuringUnit.MeasuringUnitID}>
                    <TableCell>{measuringUnit.MeasuringUnitID}</TableCell>
                    <TableCell className="font-medium">{(measuringUnit.MeasuringUnitName)}</TableCell>
                    <TableCell className="text-right">{measuringUnit.MeasuringUnitSymbol}</TableCell>
                    <TableCell className="flex justify-end">
                    <TooltipProvider> 
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              className="mr-2"
                              variant="outline"
                              onClick={() => handleEditMeasuringUnit(measuringUnit.MeasuringUnitID)}
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
                              className='hover:bg-red-500'
                              variant="outline"
                              onClick={() => handleDeletePress(measuringUnit)}
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

      <AlertDialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Measuring Unit</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div className="flex flex-col">
              <Label htmlFor="editedEstateCode">Measring Unit Nmae</Label>
              <Input
                id="editedMeasuringUnitName"
                type="text"
                value={editedMeasuringUnitName}
                onChange={(e) => setEditedMeasuringUnitName(e.target.value)}
              />
            </div>
            <div className="flex flex-col mt-4">
              <Label htmlFor="editedMeasuringUnitSymbol">Measuring Unit Symbol</Label>
              <Input
                id="editedMeasuringUnitSymbol"
                type="text"
                value={editedMeasuringUnitSymbol}
                onChange={(e) => setEditedMeasuringUnitSymbol(e.target.value)}
              />
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="primary" onClick={handleUpdateMeasuringUnit}>Update</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Measuring Unit</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {measuringUnitToDelete && ( 
            <div>
              Are you sure you want to delete this measuring unit? With name: {measuringUnitToDelete.MeasuringUnitName} and symbol {measuringUnitToDelete.MeasuringUnitSymbol}
            </div>
          )}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button className='bg-red-600 hover:bg-red-500' variant="destructive" onClick={() => handleDeleteMeasuringUnit(measuringUnitToDelete.MeasuringUnitID)}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewAllMeasuringUnits