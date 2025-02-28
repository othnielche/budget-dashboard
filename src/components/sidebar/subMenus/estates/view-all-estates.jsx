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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';



function ViewAllEstates() {
  const { user } = useContext(AuthContext);
  const [estates, setEstates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [estateToEdit, setEstateToEdit] = useState(null);
  const [editedEstateCode, setEditedEstateCode] = useState('');
  const [editedEstateName, setEditedEstateName] = useState('');
  const [editedEstateType, setEditedEstateType] = useState('');
  const [estateToDelete, setEstateToDelete] = useState(null)
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);


  const handleEditEstate = (id) => {
    const estate = estates.find((estate) => estate.EstateID === id);
    setEstateToEdit(estate);
    setEditedEstateCode(estate.EstateCode);
    setEditedEstateName(estate.EstateName);
    setEditedEstateType(estate.Type);
    setOpenEditDialog(true);
  };

  useEffect(() => {
    const fetchEstates = async () => {
      setLoading(true);
      try {
        const response = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        if (data.success) {
          setEstates(data.estates);
        } else {
          console.error('Failed to fetch estates');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEstates();
  }, [user.token]);

  const handleDeleteEstate = async (id) => {
    try {
      const response = await API.delete(`/estate/delete-estate/${id}`, {
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

  const handleUpdateEstate = async () => {
    try {
      const response = await API.put(`/estate/update-estate/${estateToEdit.EstateID}`, {
        EstateCode: editedEstateCode,
        EstateName: editedEstateName,
        Type: editedEstateType,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });
      if (response.data.success) {
        setFeedbackMessage('Estate updated successfully!');
        setOpenFeedbackDialog(true);
        handleRefresh();
      } else {
        setFeedbackMessage('Failed to update estate. Please try again.');
        setOpenFeedbackDialog(true);
      }
    } catch (error) {
      setFeedbackMessage('Failed to update estate. Please try again.');
      setOpenFeedbackDialog(true);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await API.get("/group/get-all-groups", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        setGroups(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGroups();
  }, [user.token]);

  const handleDeletePress = async (estate) => {
    try {
      setEstateToDelete(estate)
      setOpenDeleteDialog(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await API.get("/estate/get-all-estates", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      });
      const data = response.data;
      if (data.success) {
        setEstates(data.estates);
      } else {
        console.error('Failed to fetch estates');
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
        <Card className='mt-4'> 

        <div className='flex  mt-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estate ID</TableHead>
                <TableHead className="font-medium">Estate Code</TableHead>
                <TableHead className='text-right'>Estate Name</TableHead>
                <TableHead className='text-right'>Estate Type</TableHead>
                <TableHead className='text-right'>Group Name</TableHead>
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
                estates.map((estate) => (
                  <TableRow key={estate.EstateID}>
                    <TableCell>{estate.EstateID}</TableCell>
                    <TableCell className="font-medium">{estate.EstateCode}</TableCell>
                    <TableCell className="text-right">{estate.EstateName}</TableCell>
                    <TableCell className="text-right">{estate.Type}</TableCell>
                    <TableCell className="text-right">
                      {groups.find((group) => group.GroupID === estate.GroupID)?.GroupName}
                    </TableCell>
                    <TableCell className="flex justify-end">
                    <TooltipProvider> 
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              className="mr-2"
                              variant="outline"
                              onClick={() => handleEditEstate(estate.EstateID)}
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
                              onClick={() => handleDeletePress(estate)}
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
        </Card>
            <TableCaption className='flex justify-center'>Estates</TableCaption>
      </div>

      <AlertDialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Estate</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <form>
              <div className="flex flex-col">
                <Label htmlFor="editedEstateCode">Estate Code</Label>
                <Input
                  id="editedEstateCode"
                  type="text"
                  value={editedEstateCode}
                  onChange={(e) => setEditedEstateCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col mt-4">
                <Label htmlFor="editedEstateName">Estate Name</Label>
                <Input
                  id="editedEstateName"
                  type="text"
                  value={editedEstateName}
                  onChange={(e) => setEditedEstateName(e.target.value)}
                />
              </div>
              <div className="flex flex-col mt-4">
                <Label htmlFor="editedEstateType">Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">{editedEstateType}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                      value={editedEstateType}
                      onValueChange={(value) => setEditedEstateType(value)}
                    >
                      <DropdownMenuRadioItem value="Service">Service</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Estate">Estate</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </form>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="primary" onClick={handleUpdateEstate}>Update</Button>
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
            <AlertDialogTitle>Delete Estate</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
           {estateToDelete && ( 
            <div>
              Are you sure you want to delete this estate? With code: {estateToDelete.EstateCode} and Name {estateToDelete.EstateName}
            </div>
          )}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => handleDeleteEstate(estateToDelete.EstateID)}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewAllEstates;