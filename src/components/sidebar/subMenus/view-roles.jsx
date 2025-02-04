import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  

function ViewRoles() {
  return (
    <div className='flex flex-col justify-center h-full w-full items-center'>
        <Table>
            <TableCaption>User Roles</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
        </Table>
    </div>
  )
}

export default ViewRoles