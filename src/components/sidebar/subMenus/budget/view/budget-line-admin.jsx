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
  Filter,
  RefreshCw,
  Search,
  CalendarIcon 
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import CreateRequisitionForm from '@/components/requisition/create-requisition-form';
import { toast } from 'sonner';


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
  const [date, setDate] = useState(null);
  const [searchInputRef] = useState(null);




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
      console.log("Creating Fuse instance with data:", budgetLines.length, "items");
      const fuseOptions = {
        keys: [
          'BudgetLineID',
          'CostUnitID',
          'BudgetLineItems.0.ItemName',
          'BudgetLineItems.0.ItemCode',
          'BudgetLineItems.0.MeasuringUnit.MeasuringUnitName',
          'BudgetLineItems.0.MeasuringUnit.MeasuringUnitSymbol'
        ],
        threshold: 0.4, // Lower threshold for more sensitive matching
        includeScore: true,
        ignoreLocation: true, // Ignore the location of the pattern within the string
        useExtendedSearch: true
      };
      
      const fuse = new Fuse(budgetLines, fuseOptions);
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
      
      // Store original data before search
      const originalData = [...budgetLines];
      
      const results = fuse.search(term);
      console.log("Search results:", results);
      
      if (results.length > 0) {
        // Update the budgetLines state with the search results
        const searchResults = results.map(result => result.item);
        console.log("Mapped search results:", searchResults);
        setBudgetLines(searchResults);
      } else {
        console.log("No results found for term:", term);
        // Optionally show a "no results" message instead of clearing the data
        setBudgetLines([]);
      }
    } else {
      console.log("Cannot search: Fuse instance or budget lines not available", {
        fuseExists: !!fuse,
        budgetLinesCount: budgetLines.length
      });
    }
  };
  
  // Add a function to reset search
  const resetSearch = () => {
    setSearchTerm('');
    fetchBudgetLines();
  };
  
  // Debounce search to avoid too many searches while typing
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

  // Add this to the onChange handler for the search input
  const handleSearchInputChange = (e) => {
    console.log("Search input changed:", e.target.value);
    setSearchTerm(e.target.value);
  };

  // Update the useEffect for date changes
  useEffect(() => {
    if (date) {
      const newYear = date.getFullYear().toString();
      setYear(newYear);
      
      // If estateId is already selected, automatically fetch data
      if (estateId) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          fetchBudgetLines();
        }, 100);
      }
    }
  }, [date]);

  return (
    <Card>
      <h3 className='p-4 font-bold text-xl'>Budget Lines {estateName ? estateName : ''}</h3>
      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Select
            value={estates.find((estate) => estate.EstateID === estateId)}
            onValueChange={handleEstateChange}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Select an Estate" /></SelectTrigger>
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
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
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
            </>
          )}
        </div>
        
        <div className="col-span-2">
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
        </div>
        
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