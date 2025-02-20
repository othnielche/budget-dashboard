import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthContext } from '@/contexts/authContext'
import API from '@/lib/axios'
import React, { useContext, useState } from 'react'

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


function CreateMeasuringUnit() {
  const { user } = useContext(AuthContext);
  const [measuringUnitName, setMeasuringUnitName] = useState("");
  const [measuringUnitSymbol, setMeasuringUnitSymbol] = useState("");
  const [open, setOpen] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");

  const handleCreateMeasuringUnit = () => {
    if (measuringUnitName === "" || measuringUnitSymbol === "") {
     
      setOpenAlertDialog(false);
    } else {
      setOpen(true);
    }
  }
  const handleCancel = () => {
    setOpen(false)
  }

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
  }

  const handleConfirm = async () => {
    try {
      const response = await API.post("measuring-unit/add-measuring-unit", {
        MeasuringUnitName: (measuringUnitName).toLocaleLowerCase(), 
        MeasuringUnitSymbol: (measuringUnitSymbol).toLocaleLowerCase()
        },  {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          }
        });
        if (response.data.success) {
          setAlertDialogTitle('Success!');
          setAlertDialogMessage("Measuring Unit Created Successfully!");
          setOpenAlertDialog(true);
          setMeasuringUnitName("");
          setMeasuringUnitSymbol("");
        }
      } catch (error) {
        if (error.resposne && error.response.data) {
          setAlertDialogTitle("Error!");
          console.error(error);
          setAlertDialogMessage(`Failed to create measuring unit. Reason: ${error.response.data.error || "try again"}`);
        }
      } finally {
        setOpen(false);
      }  
  }
  return (
    <div>
      <form>
        <div className='flex flex-col mt-4 ml-2'>
          <div className='flex flex-row'>
            <div className='w-1/4'>
              <Label htmlFor='Matricule'>Measuring Unit Name</Label>
              <Input
                id='MeasuringUnitName'
                type='text'
                placeholder='measuring unit name'
                value={measuringUnitName}
                onChange={(e) => setMeasuringUnitName(e.target.value)}
                required
              />
            </div>
            <div className='ml-4 w-1/4'>
              <Label htmlFor='text'>Measuring Unit Symbol</Label>
              <Input
                id='MeasuringUnitSymbol'
                type='text'
                value={measuringUnitSymbol}
                onChange={(e) => setMeasuringUnitSymbol(e.target.value)}
                placeholder='measuring unit symbol'
                required
              />
            </div>
          </div>
          <div className='mt-4 w-1/2'>
            <Button type="submit" onClick={handleCreateMeasuringUnit} >Create Measuring Unit</Button>
          </div>
        </div>
    </form>
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Measuring Unit Creation</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to create a new measuring unit with name {measuringUnitName} and symbol {measuringUnitSymbol}?
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
  )
}

export default CreateMeasuringUnit