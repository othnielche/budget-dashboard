import React, { useState, useEffect, useContext } from 'react'
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

import API from '@/lib/axios';
import { AuthContext } from '@/contexts/authContext';
import { Button } from '@/components/ui/button';

function ViewAllUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await API.get("/auth/get-all-users", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        localStorage.setItem('users', data)
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };
    getUsers();
  }, [user.token]);
  return (
    
    <div className='flex flex-col'>
      <div className='font-medium text-xl mt-10'>
        <text className=''> View All Users</text>
      </div>
      <div className='flex max-w-screen-xl mt-4'>
        <Table>
          <TableCaption>Users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='font-'>User ID</TableHead>
              <TableHead className='text-right'>Matricule</TableHead>
              <TableHead className='text-right'>User Name</TableHead>
              <TableHead className='text-right'>User Role</TableHead>
              <TableHead className='text-right'>Group</TableHead>
              <TableHead className='text-right'>Estate</TableHead>
              <TableHead className='text-right'>User Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user,index) => (
              <TableRow key={index}>
                <TableCell>{user.UserID}</TableCell>
                <TableCell className='text-right'>{user.Matricule}</TableCell>
                <TableCell className='text-right'>{user.Name}</TableCell>
                <TableCell className='text-right'>{user.UserRoleID}</TableCell>
                <TableCell className='text-right'>{user.GroupID}</TableCell>
                <TableCell className='text-right'>{user.EstateID}</TableCell>
                <TableCell className='text-right'><Button>Disable User</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ViewAllUsers