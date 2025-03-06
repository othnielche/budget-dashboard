import React, { useState, useEffect, useContext, useRef } from 'react';
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
import { Card, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown, 
  HandCoins, 
  RefreshCw,
  Search,
  CalendarIcon,
  Building
} from "lucide-react"

import { 
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import Fuse from 'fuse.js';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

function BudgetLineGroupManagerMC() {
  const { user } = useContext(AuthContext);
  const [fuse, setFuse] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [estates, setEstates] = useState([]);
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estateId, setEstateId] = useState('');
  const [estateName, setEstateName] = useState('');
  const [year, setYear] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(null);
  const searchInputRef = useRef(null);

  // Check if user has a group code
  if (!user.groupCode) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">Access Error</h3>
        <p className="text-red-500">
          You don't have a group assigned to your account. 
          Please contact an administrator to assign you to a group.
        </p>
        <p className="mt-4">
          Group Managers and Managing Controllers must be assigned to a group to view budget lines.
        </p>
      </Card>
    );
  }

  // Fetch estates belonging to the user's group
  useEffect(() => {
    const fetchEstatesInGroup = async () => {
      try {
        setLoading(true);
        // First, get all estates
        const response = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        
        // Get all groups to find the group ID from the group code
        const groupResponse = await API.get("/group/get-all-groups", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        
        const groups = groupResponse.data.data;
        const userGroup = groups.find(group => group.GroupCode === user.groupCode);
        
        if (userGroup) {
          setGroupName(userGroup.GroupName);
          
          // Filter estates that belong to the user's group ID
          const allEstates = response.data.estates;
          const groupEstates = allEstates.filter(estate => estate.GroupID === userGroup.GroupID);
          
          setEstates(groupEstates);
        } else {
          console.error("User group not found");
          setEstates([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching estates:", error);
        setLoading(false);
      }
    };
    
    if (user && user.groupCode) {
      fetchEstatesInGroup();
    }
  }, [user]);

  const handleEstateChange = (estate) => {
    setEstateId(estate.EstateID);
    setEstateName(estate.EstateName);
    // If year is already selected, automatically fetch data
    if (year) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        fetchBudgetLines();
      }, 100);
    }
  };

  const handleYearChange = (selectedYear) => {
    setYear(selectedYear);
    // If estateId is already selected, automatically fetch data
    if (estateId) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        fetchBudgetLines();
      }, 100);
    }
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
      
      console.log("Budget lines response:", response.data);
      const budgetLines = response.data.data;
    
      setBudgetLines(budgetLines);
      setTotalPages(response.data.pagination.total);
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
      const fuseOptions = {
        keys: [
          'BudgetLineID',
          'CostUnitID',
          'BudgetLineItems.0.ItemName',
          'BudgetLineItems.0.ItemCode',
          'BudgetLineItems.0.MeasuringUnit.MeasuringUnitName',
          'BudgetLineItems.0.MeasuringUnit.MeasuringUnitSymbol'
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        useExtendedSearch: true
      };
      
      const fuse = new Fuse(budgetLines, fuseOptions);
      setFuse(fuse);
    }
  }, [budgetLines]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Filter budget lines based on search term
  const filteredBudgetLines = React.useMemo(() => {
    if (!searchTerm || !fuse) return budgetLines;
    
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [searchTerm, budgetLines, fuse]);

  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <h3 className='p-4 font-bold text-xl'>
        Budget Lines for {groupName ? `Group: ${groupName}` : 'Your Group'} 
        {estateName ? ` - Estate: ${estateName}` : ''}
      </h3>
      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Select
            value={estates.find((estate) => estate.EstateID === estateId)}
            onValueChange={handleEstateChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an Estate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Select Estate</SelectItem>
              {estates.map((estate) => (
                <SelectItem key={estate.EstateID} value={estate}>
                  {estate.EstateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative col-span-5">
          {loading && !budgetLines.length ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, item name, code, or unit..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full pl-8"
                ref={searchInputRef}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={resetSearch}
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Year selector */}
        <div className="col-span-2">
          {loading && !budgetLines.length ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {year ? year : <span>Select year</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((yearOption) => (
                    <Button
                      key={yearOption}
                      variant={year === yearOption.toString() ? "default" : "outline"}
                      className="h-9 w-full"
                      onClick={() => {
                        handleYearChange(yearOption.toString());
                        // Close the popover after selection
                        document.querySelector('[data-radix-popper-content-id]')?.closest('button')?.click();
                      }}
                    >
                      {yearOption}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Refresh button */}
        <div className="col-span-2">
          <Button onClick={fetchBudgetLines} disabled={loading || !estateId || !year} className="w-full">
            {loading ? (
              <>
                <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Budget lines table */}
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
          {loading ? (
            renderSkeletonRows()
          ) : (
            filteredBudgetLines.map((line) => (
              <React.Fragment key={line.BudgetLineID}>
                <TableRow className="cursor-pointer" onClick={() => toggleExpandRow(line.BudgetLineID)}>
                  <TableCell>{line.BudgetLineID}</TableCell>
                  <TableCell className="">{line.BudgetLineItems[0].ItemName}</TableCell>
                  <TableCell>{line.BudgetLineItems[0].ItemCode}</TableCell>
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
                                <TableCaption>Monthly Budget Allocation for {year}</TableCaption>
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
            ))
          )}
          {!loading && filteredBudgetLines.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {estateId && year 
                  ? "No budget lines found for this estate and year" 
                  : !estateId 
                    ? "Please select an estate" 
                    : "Please select a year"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {totalPages > 1 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>
                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    <PaginationEllipsis />
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  </PaginationContent>
                </Pagination>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </Card>
  );
}

export default BudgetLineGroupManagerMC;