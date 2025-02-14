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

function CreateEstate() {
  const { user } = useContext(AuthContext)
  const [EstateCode, setEstateCode] = useState('')
  const [EstateName, setEstateName] = useState('')
  const [EstateSymbol, setEstateSymbol] = useState('')
  const [groups, serGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [Type, setType] = useState('')
  const [openAlertDialog, setOpenAlertDialog] = useState(false)
  const [alertDialogMessage, setAlertDialogMessage] = useState('')
  const [alertDialogTitle, setAlertDialogTitle] = useState('')
  const [open, setOpen] = useState(false)

  const handleCreateEstate = () => {
    if (EstateCode && EstateName && EstateSymbol && selectedGroup && Type) {
      setOpen(true);
    } else {
      console.log("Please fill in all required fields");
    }
  }


  const handleConfirm = async () => {
    try {
      const response = await API.post("/estate/create-estate", {
        EstateCode: EstateCode,
        EstateName: EstateName,
        EstateSymbol: EstateSymbol,
        GroupID: parseInt(selectedGroup),
        Type: Type
      }, { 
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        }
      });
      if (response.data.success) {
        setOpenAlertDialog(true);
        setAlertDialogTitle("Success!");
        setAlertDialogMessage(
          <div>
            <b>Estate Created Successfully!</b><br /><br />
            <b>Estate Details:</b><br />
            <div>Estate Code: {EstateCode}</div>
            <div>Estate Name: {EstateName}</div>
            <div>Estate Symbol: {EstateSymbol}</div>
            <div>Group ID: {selectedGroup}</div>
            <div>Type: {Type}</div>
          </div>
        );
        setEstateCode("");
        setEstateName("");
        setEstateSymbol("");
        setGroupID("");
        setType("");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setOpenAlertDialog(true);
        setAlertDialogTitle("Error!");
        setAlertDialogMessage(
          <div>
            <b>Error Creating Estate:</b><br /><br />
            <div>{error.response.data.error}</div>
          </div>
        );
      }
    } finally {
      setOpen(false);
    }
  }

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const repsonse = await API.get("/group/get-all-groups", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = repsonse.data;
        serGroups(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchGroups();
  }, []);

  const handleCancel = () => {
    setOpen(false);
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
                <Label htmlFor='Matricule'>Estate Code</Label>
                <Input
                  id='EstateCode'
                  type='text'
                  placeholder='estate code'
                  value={EstateCode}
                  onChange={(e) => setEstateCode(e.target.value)}
                  required
                />
              </div>
              <div className='ml-4 w-1/4'>
                <Label htmlFor='text'>Estate Name</Label>
                <Input
                  id='EstateName'
                  type='text'
                  value={EstateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  placeholder='estate name'
                  required
                />
              </div>
              <div className='ml-4 w-1/4'>
                <Label htmlFor='text'>Estate Symbol</Label>
                <Input
                  id='EstateSymbol'
                  type='text'
                  value={EstateSymbol}
                  onChange={(e) => setEstateSymbol(e.target.value)}
                  placeholder='estate symbol'
                  required
                />
              </div>
            </div>
            <div className='flex flex-row'> 
            <div className='w-1/4 flex flex-col mt-4'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline'>Select Group</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Group</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedGroup} onValueChange={setSelectedGroup}>
                      {groups.map((group) => (
                        <DropdownMenuRadioItem key={group.GroupID} value={group.GroupID}>
                          {group.GroupName}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='w-1/4 flex flex-col mt-4 ml-4'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline'>Select Type</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Estate or Service</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={Type} onValueChange={setType}>
                      <DropdownMenuRadioItem value="Estate">Estate</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Service">Service</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className='mt-4 w-1/2'>
              <Button type="submit" onClick={handleCreateEstate}>Create Estate</Button>
            </div>
          </div>
      </form>
       <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <span></span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Estate Creation</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              <div>
                <b>Estate Details:</b><br />
                <br />
                <div><b>Estate Code:</b> {EstateCode}</div>
                <div><b>Estate Name:</b> {EstateName}</div>
                <div><b>Estate Symbol:</b> {EstateSymbol}</div>
                <div><b>Group ID:</b> {selectedGroup}</div>
                <div><b>Type:</b> {Type}</div>
              </div>
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

export default CreateEstate