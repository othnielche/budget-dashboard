import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '@/contexts/authContext';
import API from '@/lib/axios';

import { AuthContext } from "@/contexts/authContext";

import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableCaption, 
  TableFooter
} from "@/components/ui/table";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown, 
  HandCoins, 
  Filter 
} from "lucide-react"

import { 
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import Fuse from 'fuse.js';
import { fromJSON } from 'postcss';


function BudgetLineAdmin() {
  const { user } = useContext(AuthContext);
  const [fuse, setFuse] = useState(null);
  const [estateName, setEstateName] = useState('');
  const [estates, setEstates] = useState([]);
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estateId, setEstateId] = useState('');
  const [year, setYear] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');




  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        const data = response.data;
        setEstates(data.estates);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEstates();
  }, [user.token]);

  const handleEstateChange = (estate) => {
    setEstateId(estate.EstateID);
    console.log(estateId);
  };

  const fetchBudgetLines = async () => {
    if (!estateId || !year) return;
    setLoading(true);
    try {
      const response = await API.get(`/budgetline/get-budget-lines-by-estate`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: { estateId, year, page: currentPage }
      });
      
      console.log(currentPage)
      console.log(response.data);
      const budgetLines = response.data.data; // Access the data array
    
      setBudgetLines(budgetLines);
      console.log(budgetLines)
      setTotalPages(response.data.pagination.total); // Access the total property
    } catch (error) {
      console.error("Error fetching budget lines", error);
    }
    setLoading(false);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBudgetLines();
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  function getMonthName(dateString) {
    const date = new Date(dateString);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[date.getMonth()];
  }

  // Create a Fuse instance with the budgetLines data
  useEffect(() => {
    if (budgetLines.length > 0) {
      const fuse = new Fuse(budgetLines, {
        keys: ['BudgetLineID', 'BudgetLineItems.Item.ItemName', 'BudgetLineItems.Item.ItemCode', 'CostUnitID'],
        threshold: 0.6,
      });
      setFuse(fuse);
    }
  }, [budgetLines, estateId, year]);

  // Update the Fuse instance with the new budgetLines data
  const updateFuse = (budgetLines) => {
    if(fuse) {
      fuse.setCollection(budgetLines.data);
    }
  };


  // Search function
  const handleSearch = () => {
    if (fuse) {
      const results = fuse.search(searchTerm);
      console.log(results);
      // update the budgetLines state with the search results
      setBudgetLines(results.map((result) => result.item));
    }
  };
  
  // Update the Fuse instance when the budgetLines data changes
  useEffect(() => {
    updateFuse(budgetLines);
  }, [budgetLines]);


  return (
    <Card>
      <h3 className='p-4 font-bold text-xl'>Budget Lines {estateName ? estateName : ''}</h3>
      <div className="p-4 flex gap-4">
        <Select
          value={estates.find((estate) => estate.EstateID === estateId)}
          onValueChange={handleEstateChange}
        >
          <SelectTrigger ><SelectValue placeholder="Select an Estate" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Select Estate</SelectItem>
            {estates.map((estate) => (
              <SelectItem key={estate.EstateID} value={estate}>
                {estate.EstateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(searchTerm);
          }}
        />
        <Input
          placeholder="Enter Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <Button onClick={fetchBudgetLines} disabled={loading}>Fetch</Button>
      </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BudgetLineID</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Cost Unit</TableHead>
              <TableHead>Measuring Unit Symbol</TableHead>
              <TableHead className=''>Quantity Budgeted</TableHead>
              <TableHead className="w-[50px]" />

            </TableRow>
          </TableHeader>
  
          <TableBody>
          {budgetLines.map((line) => 
          <React.Fragment key={line.BudgetLineID}>

            <TableRow className="cursor-pointer" onClick={() => toggleExpandRow(line.BudgetLineID)}>
              <TableCell>{line.BudgetLineID}</TableCell>
              <TableCell className="">{line.BudgetLineItems[0].ItemName}</TableCell>
              <TableCell >{line.BudgetLineItems[0].ItemCode}</TableCell>
              <TableCell>{line.BudgetLineItems[0].UnitCost}</TableCell>
              <TableCell>{line.CostUnitID}</TableCell>
              <TableCell>{line.BudgetLineItems[0].MeasuringUnit.MeasuringUnitSymbol}</TableCell>
              <TableCell className='flex '>{line.TotalBudgetedAmount} <div className=' text-right font-bold'>FCFA</div></TableCell>
              <TableCell>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    expandedRow === line.BudgetLineID ? "transform rotate-180" : ""
                  }`}
                />
              </TableCell>
            </TableRow>
            {expandedRow === line.BudgetLineID && (
              <TableRow>
                <TableCell colSpan={8} className={`bg-muted transition-all duration-500 ease-in-out ${expandedRow === line.BudgetLineID ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
                  <div className="flex flex-row p-4">
                    <div className='w-1/2'>
                      <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                      <div className='w-1/2'>
                      <p>{line.BudgetLineItems[0].ItemName}</p>
                        <Card className='bg-muted' >
                          <Table>
                            <TableCaption>Monthly Budget Allocation for 2025</TableCaption>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[150px]">Month</TableHead>
                                <TableHead className='text-right'>Budget Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {line.MonthlyPhasings.map((month) => (
                                <TableRow key={month.MonthlyPhasingID}>
                                  <TableCell className="font-medium">{getMonthName(month.Month)}</TableCell>
                                  <TableCell className='text-right'>{month.AllocatedMonthBudget ? month.AllocatedMonthBudget : 0}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>
                    </div>
                    <div className='flex flex-col w-1/2 text-right justify-end items-end'>
                    <Button className='bottom-0'><HandCoins />Make Requisition</Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        )}
          </TableBody>
          {totalPages > 1 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>
                  <Pagination>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                    <PaginationEllipsis />
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                  </Pagination>
                </TableCell>
              </TableRow>
            </TableFooter>
            )
          } 
        </Table>
        </Card>
    );
      
  }
      export default BudgetLineAdmin