import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'


function CreateNewUser() {
  const [role, setRole] = useState("Select Role")

  return (
    <div>
      <div className='font-medium text-xl mt-10'>
        <text className=''> Create An Account For A New User</text>
      </div>
      <form>
        <div className='flex flex-col mt-4 ml-2'>
          <div className='flex flex-row '>
              <div className='w-1/4'>
                <Label htmlFor="Matricule">Matricule</Label>
                <Input className='' id="Matricule" type="number" placeholder="matricule" required/>
              </div>
              <div className='ml-4 w-1/4 mr-4'>
                <Label htmlFor="Name">Name</Label>
                <Input className=' active:' id="Name" type="text" placeholder="name" required />
              </div>
          </div>
          <div className='flex flex-row mt-4 '>
              <div className='w-1/4'>
                <Label htmlFor="Matricule">Group Code</Label>
                <Input className='' id="GroupCode" type="text" placeholder="group code" required/>
              </div>
              <div className='ml-4 w-1/4 mr-4'>
                <Label htmlFor="EstateCode">Estate Code</Label>
                <Input className='' id="EstateCode" type="text" placeholder="estate code" required />
              </div>
          </div>
          <div className='flex flex-row mt-4'>
            <div className='w-1/4'>
              <Label htmlFor="text">Password</Label>
              <Input required className='' id="Password" type="password" placeholder="password" />
            </div>
          </div>
          <div>
              <text className='text-sm italic'>User has to update their password with one only they know *</text>
          </div>
          <div className='mt-4 w-1/2 text-right ml-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'> Select User Role</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select User Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                  <DropdownMenuRadioItem value="1">Administrator</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">Group Manager</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="3">Managing Controller (MC)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='4'>Estate Manager</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='5'>Supplies Manager</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='6'>Head Office Manging Controller (HOMC)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='flex mt-4 w-1'>
            <Button variant='' type='submit'>Create User</Button>
          </div>
          </div>
      </form>
    </div>
  )
}

export default CreateNewUser