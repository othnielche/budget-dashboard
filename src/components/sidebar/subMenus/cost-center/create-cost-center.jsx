import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import API from '@/lib/axios';
import React, { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CreateCostCenter = () => {
  const { user } = useContext(AuthContext);
  const [CostCenterCode, setCostCenterCode] = useState("");
  const [CostCenterName, setCostCenterName] = useState("");
  const [open, setOpen] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");

  const handleCreateCostCenter = () => {
    setOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await API.post("/cost-center/add-cost-center", {
        CostCenterCode: CostCenterCode,
        CostCenterName: CostCenterName
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });

      if (response.data.success) {
        setOpenAlertDialog(true);
        setAlertDialogTitle("Success!");
        setAlertDialogMessage("Cost center created successfully!");
        setCostCenterCode("");
        setCostCenterName("");
      } 
    } catch (error) {
      if (error.response && error.response.data) {
        setAlertDialogTitle("Error");
        console.error(error);
        setOpenAlertDialog(true);
        setAlertDialogMessage(`Failed to create cost center. \nReason: ${error.response.data.error}`);
      } else {
        setAlertDialogTitle("Error");
        console.error(error);
        setOpenAlertDialog(true);
        setAlertDialogMessage("Failed to create cost center. Try again.");
      }
    } finally{
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
  };

  return (
    <div>
      <form>
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
                onChange={(e) => setCostCenterName(e.target.value)}
                placeholder='cost center name'
                required
              />
            </div>
          </div>
          <div className='mt-4 w-1/2'>
            <Button type="submit" onClick={handleCreateCostCenter}>Create Cost Center</Button>
          </div>
        </div>
      </form>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <span></span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cost Center Creation</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to create a new cost center with code {CostCenterCode} and name {CostCenterName}?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={openAlertDialog} onOpenChange={handleAlertDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {alertDialogMessage}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlertDialogClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateCostCenter;