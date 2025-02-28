import React, { useState, useContext, useEffect} from 'react'
import { AuthContext } from '@/contexts/authContext'
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
import BudgetLineAdmin from './budget-line-admin';



function ViewBudgets() {
  return (
    <div>
      <BudgetLineAdmin />
    </div>
  )
}

export default ViewBudgets