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


function CreateGroup() {
  const { user } = useContext(AuthContext);
  const [GroupCode, setGroupCode] = useState("");
  const [GroupName, setGroupName] = useState("");
  const [GroupSymbol, setGroupSymbol] = useState("")
  const [open, setOpen] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");
  
  const handleCreateGroup = () => {
    setOpen(true);
  }

  const handleConfirm = async () => {
    try {
      const response = await API.post("/group/create-group", {
        GroupCode: GroupCode,
        GroupName: GroupName,
        GroupSymbol: GroupSymbol
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });

      if (response.data.seccess) {
        setOpenAlertDialog(true);
        setAlertDialogTitle("Success!");
        setAlertDialogMessage("Group Created successfully!");
        setGroupCode("");
        setGroupName("");
        setGroupSymbol("");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setAlertDialogTitle("Error");
        console.error(error);
        setOpenAlertDialog(true)
        setAlertDialogMessage(`Failed to create group. Reason: ${error.response.data.error || "Try again"}`);
      }
    } finally {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setOpen(false)
  }

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
  }
  return (
    <div>
      <form>
          <div className='flex flex-col mt-4 ml-2'>
            <div className='flex flex-row'>
              <div className='w-1/4'>
                <Label htmlFor='Matricule'>Group Code</Label>
                <Input
                  id='GroupCode'
                  type='text'
                  placeholder='group code'
                  value={GroupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  required
                />
              </div>
              <div className='ml-4 w-1/4'>
                <Label htmlFor='text'>Group Name</Label>
                <Input
                  id='GroupName'
                  type='text'
                  value={GroupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder='group name'
                  required
                />
              </div>
              <div className='ml-4 w-1/4'>
                <Label htmlFor='text'>Group Symbol</Label>
                <Input
                  id='GroupSymbol'
                  type='text'
                  value={GroupSymbol}
                  onChange={(e) => setGroupSymbol(e.target.value)}
                  placeholder='group symbol'
                  required
                />
              </div>
            </div>
            <div className='mt-4 w-1/2'>
              <Button type="submit" onClick={handleCreateGroup} >Create Group</Button>
            </div>
          </div>
      </form>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Group Creation</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to create a new group with code {GroupCode}, name {GroupName} and symbol {GroupSymbol}?
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

export default CreateGroup