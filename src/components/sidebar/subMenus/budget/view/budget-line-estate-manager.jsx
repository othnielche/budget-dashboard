import React, { useState, useEffect, useContext, useRef } from 'react';
import API from '@/lib/axios';
import { AuthContext } from "@/contexts/authContext";
import { Navigate } from 'react-router-dom';
import ROLES from '@/lib/role';
import { toast } from 'sonner';

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
  Lock
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
import CreateRequisitionForm from '@/components/requisition/create-requisition-form';

function BudgetLineEstateManager() {
  const { user } = useContext(AuthContext);
  const [fuse, setFuse] = useState(null);
  const [estateName, setEstateName] = useState('');
  const [estateInfo, setEstateInfo] = useState(null);
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estateId, setEstateId] = useState('');
  const [year, setYear] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(null);
  const searchInputRef = useRef(null);

  // If user doesn't have an estate code, show error
  if (!user.estateCode) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">Access Error</h3>
        <p className="text-red-500">
          You don't have an estate assigned to your account. 
          Please contact an administrator to assign you to an estate.
        </p>
        <p className="mt-4">
          Estate Managers must be assigned to an estate to view budget lines.
        </p>
      </Card>
    );
  }
  
  // Fetch the estate information for the current user
  useEffect(() => {
    const fetchEstateInfo = async () => {
      try {
        setLoading(true);
        // Get all estates
        const response = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        
        // Find the estate that matches the user's estateCode
        const estates = response.data.estates;
        const userEstate = estates.find(estate => estate.EstateCode === user.estateCode);
        
        if (userEstate) {
          setEstateInfo(userEstate);
          setEstateId(userEstate.EstateID);
          setEstateName(userEstate.EstateName);
          console.log("Estate manager's estate:", userEstate);
          
          // If year is already selected, fetch budget lines
          if (year) {
            fetchBudgetLines(userEstate.EstateID);
          }
        } else {
          console.error("Estate not found for code:", user.estateCode);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching estate information:", error);
        setLoading(false);
      }
    };
    
    if (user && user.estateCode) {
      fetchEstateInfo();
    }
  }, [user]);
  
  const handleYearChange = (selectedYear) => {
    setYear(selectedYear);
    // If estateId is already set, fetch budget lines
    if (estateId) {
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
      console.log("Creating Fuse instance with data:", budgetLines.length, "items");
      
      // Create a simpler, flattened version of the data for searching
      const searchableData = budgetLines.map(line => ({
        id: line.BudgetLineID,
        costUnitId: line.CostUnitID,
        totalAmount: line.TotalBudgetedAmount,
        itemName: line.BudgetLineItems[0]?.ItemName || '',
        itemCode: line.BudgetLineItems[0]?.ItemCode || '',
        unitCost: line.BudgetLineItems[0]?.UnitCost || '',
        measuringUnitName: line.BudgetLineItems[0]?.MeasuringUnit?.MeasuringUnitName || '',
        measuringUnitSymbol: line.BudgetLineItems[0]?.MeasuringUnit?.MeasuringUnitSymbol || '',
        // Store reference to original object
        original: line
      }));
      
      console.log("Searchable data created:", searchableData);
      
      const fuseOptions = {
        keys: [
          'id',
          'costUnitId',
          'itemName',
          'itemCode',
          'measuringUnitName',
          'measuringUnitSymbol'
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        useExtendedSearch: true
      };
      
      const fuse = new Fuse(searchableData, fuseOptions);
      setFuse(fuse);
      console.log("Fuse instance created successfully with options:", fuseOptions);
    }
  }, [budgetLines]);

  // Search function
  const handleSearch = (term) => {
    console.log("Search triggered with term:", term);
    
    if (!term.trim()) {
      console.log("Empty search term, fetching original data");
      fetchBudgetLines();
      return;
    }
    
    if (fuse && budgetLines.length > 0) {
      console.log("Performing search with Fuse.js");
      
      const results = fuse.search(term);
      console.log("Search results:", results);
      
      if (results.length > 0) {
        // Map back to the original budget line objects
        const searchResults = results.map(result => result.item.original);
        console.log("Mapped search results:", searchResults);
        setBudgetLines(searchResults);
      } else {
        console.log("No results found for term:", term);
        setBudgetLines([]);
      }
    } else {
      console.log("Cannot search: Fuse instance or budget lines not available", {
        fuseExists: !!fuse,
        budgetLinesCount: budgetLines.length
      });
    }
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchTerm('');
    fetchBudgetLines();
    // Maintain focus on the search input after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };
  
  // Debounce search
  useEffect(() => {
    console.log("Search term changed:", searchTerm);
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        console.log("Debounce timer completed, executing search");
        handleSearch(searchTerm);
      } else if (searchTerm === '') {
        // If search term is cleared, reset to original data
        console.log("Search term cleared, resetting data");
        fetchBudgetLines();
      }
    }, 300);
    
    return () => {
      console.log("Clearing previous debounce timer");
      clearTimeout(delaySearch);
    }
  }, [searchTerm]);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    console.log("Search input changed:", e.target.value);
    setSearchTerm(e.target.value);
  };

  // Update year when date changes
  useEffect(() => {
    if (date) {
      const newYear = date.getFullYear().toString();
      setYear(newYear);
      
      // If estateId is already set, fetch budget lines
      if (estateId) {
        setTimeout(() => {
          fetchBudgetLines();
        }, 100);
      }
    }
  }, [date]);

  // Render skeleton rows for loading state
  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-4" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <h3 className='p-4 font-bold text-xl'>Budget Lines - {estateName || 'Your Estate'}</h3>
      <div className="p-4 grid grid-cols-12 gap-4">
        {/* Estate selector (disabled, showing the manager's estate) */}
        <div className="col-span-3">
          <div className="relative">
            <Select disabled value={estateInfo} onValueChange={() => {}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Loading estate..." : (estateName || "Your Estate")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={estateInfo}>{estateName}</SelectItem>
              </SelectContent>
            </Select>
            <Lock className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        {/* Search field */}
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
          <Button onClick={fetchBudgetLines} disabled={loading} className="w-full">
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
            budgetLines.map((line) => (
              <React.Fragment key={line.BudgetLineID}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={() => toggleExpandRow(line.BudgetLineID)}
                >
                  <TableCell>{line.BudgetLineID}</TableCell>
                  <TableCell className="">{line.BudgetLineItems[0].ItemName}</TableCell>
                  <TableCell>{line.BudgetLineItems[0].ItemCode}</TableCell>
                  <TableCell>{line.BudgetLineItems[0].UnitCost}</TableCell>
                  <TableCell>{line.CostUnitID}</TableCell>
                  <TableCell>{line.BudgetLineItems[0].MeasuringUnit.MeasuringUnitSymbol}</TableCell>
                  <TableCell className='flex'>{line.TotalBudgetedAmount} <div className='text-right font-bold'>FCFA</div></TableCell>
                  <TableCell>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        expandedRow === line.BudgetLineID ? "transform rotate-180" : ""
                      }`}
                    />
                  </TableCell>
                </TableRow>
                {expandedRow === line.BudgetLineID && (
                  <TableRow className="animate-in fade-in-0 duration-300">
                    <TableCell colSpan={8} className="p-0 border-b">
                      <div className="overflow-hidden transition-all duration-300 ease-in-out" 
                           style={{ maxHeight: expandedRow === line.BudgetLineID ? '2000px' : '0' }}>
                        <div className="bg-muted p-4">
                          <div className="flex flex-row gap-4">
                            <div className='w-1/2'>
                              <div className='w-full'>
                                <Card className='p-4'>
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
                            <div className='flex flex-col w-1/2 pl-4'>
                              <Card className="p-4">
                                <CardTitle className="mb-4">Create Requisition</CardTitle>
                                <CreateRequisitionForm 
                                  budgetLineId={line.BudgetLineID}
                                  budgetLineName={line.BudgetLineItems[0].ItemName}
                                  maxQuantity={line.TotalBudgetedAmount}
                                  onSuccess={() => {
                                    fetchBudgetLines();
                                    toast.success("Requisition created successfully");
                                  }}
                                />
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
          {!loading && budgetLines.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {year ? "No budget lines found for this year" : "Select a year to view budget lines"}
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

export default BudgetLineEstateManager;