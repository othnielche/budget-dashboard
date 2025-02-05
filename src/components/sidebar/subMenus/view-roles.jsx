import React, { useState, useEffect, useContext } from 'react';
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

export function ViewRoles() {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const getRoles = async () => {
      try {
        const response = await API.get("/userrole/get-all-user-roles", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        localStorage.setItem('roles', data)
        setRoles(data);
      } catch (error) {
        console.error(error);
      }
    };
    getRoles();
  }, [user.token]);

  return (
    <Table>
      <TableCaption>User Roles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className='font-'>User Role ID</TableHead>
          <TableHead>User Role</TableHead>
          <TableHead className='text-right'>User Role Code</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role, index) => (
          <TableRow key={index}>
            <TableCell>{role.UserRoleID}</TableCell>
            <TableCell>{role.Role}</TableCell>
            <TableCell className='text-right'>{role.UserRoleCode}</TableCell>
            <TableCell className='items-end'><Button>Edit</Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ViewRoles