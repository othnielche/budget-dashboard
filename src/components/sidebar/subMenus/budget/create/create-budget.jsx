import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthContext } from '@/contexts/authContext'
import API from '@/lib/axios'
import React, { useContext, useState, useEffect } from 'react'

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectGroup, 
  SelectItem, 
  SelectLabel,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select'
import { set } from 'react-hook-form'

function CreateBudget() {

  const { user } = useContext(AuthContext);
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  const [estates, setEstates] = useState([]);
  const [selectedEstateName, setSelectedEstateName] = useState('');
  const [openAlertDialog, setOpenAlertDialog] = useState(false)
  const [alertDialogMessage, setAlertDialogMessage] = useState('')
  const [alertDialogTitle, setAlertDialogTitle] = useState('')
  const [isFeedbackAlertDialogOpen, setIsFeedbackAlertDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  
  const handleCreateBudget = () => {
    if (selectedEstateName && financialYear) {
      setAlertDialogMessage(`Are you sure you want to create a budget? With for Estate/Service: ${selectedEstateName} and Financial Year: ${financialYear}`);
      setAlertDialogTitle("Create Budget");
      setOpenAlertDialog(true);
    } else {
      setFeedbackMessage(`Please fill in all required fields ${selectedEstateName}`);
      setIsFeedbackAlertDialogOpen(true)
    }
  }

  const handleConfirm = async () => {
    try {
      const response = await API.post("/budgets/create-budget", {
        EstateID: parseInt(estateID),
        BudgetYear: financialYear,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });
      if (response.data && response.data.success) {
        setOpenAlertDialog(false)
        setFeedbackMessage("Budget created successfully!");
        setIsFeedbackAlertDialogOpen(true);
      }
    } catch (error) {
      setOpenAlertDialog(false)
      if (error.response) {
        console.error("Error creating budget:", error.response.data);
        setFeedbackMessage(error.response.data.error);
      } else if (error.request) {
        console.error("Error creating budget:", error.request);
        setFeedbackMessage("Failed to create budget. Please try again.");
      } else {
        console.error("Error creating budget:", error.message);
        setFeedbackMessage("Failed to create budget. Please try again.");
      }
      setIsFeedbackAlertDialogOpen(true);
    }
  };

  const getEstateID = (estateName) => {
    const estate = estates.find((estate) => estate.EstateName === estateName);
    return estate ? estate.EstateID : null;
  };

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const repsonse = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = repsonse.data;
        setEstates(data.estates);
      } catch (error) {
        console.error(error);
      }
    }
    fetchEstates();
  }, [user.token]);

  const handleCancel = () => {
    setOpenAlertDialog(false)
  }
  
  const estateID = getEstateID(selectedEstateName);
  return (
    <div>
      <form>
        <div className='flex flex-col mt-4 ml-2'>
          <div className='flex flex-row'>
            <div className=' w-1/4'>
              <Label htmlFor='text'>Financial Year</Label>
              <Input
                id='FinancialYear'
                type='number'
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                placeholder='financial year'
                required
              />
            </div>
            <div className='ml-4 w-1/4'>
              <Label htmlFor='Matricule'>Estate</Label>
              <Select
                value={selectedEstateName}
                onValueChange={(value) => {
                  setSelectedEstateName(value);
                }}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select an Estate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estates</SelectLabel>
                    {estates.map((estate) => (
                      <SelectItem key={estate.EstateID} value={estate.EstateName}>
                        {estate.EstateName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
            <div className='flex flex-row mt-4'>
              <Button onClick={handleCreateBudget}>Create Budget</Button>
            </div>  
        </div>
      </form>
      <AlertDialog open={openAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFeedbackAlertDialogOpen} onOpenChange={setIsFeedbackAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attention!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {feedbackMessage}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={()=> {setIsFeedbackAlertDialogOpen(false)}}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>

  )
}

export default CreateBudget