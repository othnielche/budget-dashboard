import React, { useState, useContext, useEffect} from 'react';
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

function ViewAllGroups() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);

  useEffect( () => {
    const getGroups = async () => {
      try {
        const response = await API.get("/group/get-all-groups", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        localStorage.setItem('groups', data.data)
        setGroups(data.data);
        console.log(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    getGroups();
  }, [user.token]);
  return (
    <div className='flex flex-col'>
      <div className='font-medium text-xl mt-10'>
        <text className=''> View All Groups</text>
      </div>
      <div className='flex max-w-screen-xl mt-4'>
        <Table>
          <TableCaption>Groups</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Group ID</TableHead>
              <TableHead className="">Group Code</TableHead>
              <TableHead>Group Name</TableHead>
              <TableHead className="text-right">Group Symbol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.GroupID}>
                <TableCell>{group.GroupID}</TableCell>
                <TableCell>{group.GroupCode}</TableCell>
                <TableCell>{group.GroupName}</TableCell>
                <TableCell className="text-right">{group.GroupSymbol}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ViewAllGroups