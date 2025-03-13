import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "@/contexts/authContext";
import API from '@/lib/axios';
import { toast } from 'sonner';
import { format } from "date-fns";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, RefreshCw, Search, FileText, Printer, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import LpoPdfGenerator from './LpoPdfGenerator';

function ViewLPOs() {
  const { user } = useContext(AuthContext);
  const [lpos, setLPOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estateId, setEstateId] = useState('');
  const [estates, setEstates] = useState([]);
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lpoDetails, setLPODetails] = useState(null);
  const [processingLPO, setProcessingLPO] = useState(false);
  
  // Alert dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [actionType, setActionType] = useState(null);
  const [selectedLPOId, setSelectedLPOId] = useState(null);
  const [comments, setComments] = useState('');
  const [estateName, setEstateName] = useState('');

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Check if user can view LPOs
  const canViewLPOs = () => {
    return user && (user.roleCode === 1 || user.roleCode === 5 || user.roleCode === 6);
  };

  // Check if user can manage LPOs (approve, complete, cancel)
  const canManageLPOs = () => {
    return user && (user.roleCode === 1 || user.roleCode === 6);
  };

  // Fetch estates on component mount
  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await API.get("/estate/get-all-estates", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        setEstates(response.data.estates);
      } catch (error) {
        console.error("Error fetching estates:", error);
      }
    };
    fetchEstates();
  }, [user.token]);

  // Fetch LPOs based on filters
  const fetchLPOs = async () => {
    if (!estateId) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/lpo/get-lpos-by-estate/${estateId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: { 
          page: currentPage, 
          limit: 10, 
          status: status === 'all' ? '' : status,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });
      
      console.log("LPOs response:", response.data);
      
      if (response.data.success) {
        setLPOs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error("Failed to fetch LPOs");
      }
    } catch (error) {
      console.error("Error fetching LPOs:", error);
      toast.error("Failed to fetch LPOs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch LPO details when expanding a row
  const fetchLPODetails = async (lpoId) => {
    try {
      const response = await API.get(`/lpo/details/${lpoId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      });
      
      setLPODetails(response.data);
    } catch (error) {
      console.error("Error fetching LPO details:", error);
      toast.error("Failed to fetch LPO details");
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLPOs();
  };

  // Toggle expanded row
  const toggleExpandRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      setLPODetails(null);
    } else {
      setExpandedRow(id);
      fetchLPODetails(id);
    }
  };

  // Handle estate change
  const handleEstateChange = (value) => {
    setEstateId(value);
    setCurrentPage(1);
    // Auto-fetch if status is already selected
    if (status) {
      setTimeout(() => {
        fetchLPOs();
      }, 100);
    }
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
    // Auto-fetch if estate is already selected
    if (estateId) {
      setTimeout(() => {
        fetchLPOs();
      }, 100);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString() + ' FCFA';
  };

  const formatMeasuringUnit = (unit) => {
    return unit === '1' ? 'Piece' : 'Box';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Initiate LPO approval
  const initiateApproveLPO = (e, lpoId) => {
    e.stopPropagation();
    setActionType('approve');
    setSelectedLPOId(lpoId);
    setConfirmDialogTitle('Approve LPO');
    setConfirmDialogMessage('Are you sure you want to approve this LPO? This action cannot be undone.');
    setShowConfirmDialog(true);
  };

  // Initiate LPO completion
  const initiateCompleteLPO = (e, lpoId) => {
    e.stopPropagation();
    setActionType('complete');
    setSelectedLPOId(lpoId);
    setConfirmDialogTitle('Complete LPO');
    setConfirmDialogMessage('Are you sure you want to mark this LPO as completed? This action cannot be undone.');
    setShowConfirmDialog(true);
  };

  // Initiate LPO cancellation
  const initiateCancelLPO = (e, lpoId) => {
    e.stopPropagation();
    setActionType('cancel');
    setSelectedLPOId(lpoId);
    setConfirmDialogTitle('Cancel LPO');
    setConfirmDialogMessage('Are you sure you want to cancel this LPO? This action cannot be undone.');
    setShowConfirmDialog(true);
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    setProcessingLPO(true);
    try {
      let endpoint = '';
      let payload = { lpoId: selectedLPOId };
      
      if (comments) {
        payload.comments = comments;
      }
      
      switch (actionType) {
        case 'approve':
          endpoint = '/lpo/approve';
          break;
        case 'complete':
          endpoint = '/lpo/complete';
          break;
        case 'cancel':
          endpoint = '/lpo/cancel';
          break;
        default:
          break;
      }
      
      const response = await API.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      });
      
      if (response.status === 200) {
        toast.success(`LPO ${actionType}d successfully`);
        fetchLPOs();
        if (expandedRow === selectedLPOId) {
          fetchLPODetails(selectedLPOId);
        }
      } else {
        toast.error(`Failed to ${actionType} LPO`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing LPO:`, error);
      toast.error(`Failed to ${actionType} LPO`);
    } finally {
      setProcessingLPO(false);
      setShowConfirmDialog(false);
      setComments('');
    }
  };

  // Print LPO
  const printLPO = (e, lpoId) => {
    e.stopPropagation();
    // Implement print functionality or redirect to print view
    toast.info("Print functionality will be implemented here");
  };

  // Add a useEffect to redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canViewLPOs()) {
      // Redirect to unauthorized page or dashboard
      toast.error("You don't have permission to view LPOs");
      // Use your routing method here, e.g.:
      // navigate('/dashboard');
    }
  }, [user]);


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Local Purchase Orders (LPOs)</CardTitle>
        <CardDescription>View and manage LPOs for your estates</CardDescription>
      </CardHeader>
      <CardContent>
        {canViewLPOs() && (
          <div className="mb-6">
            <div className="flex flex-wrap items-end gap-4">
              {/* Estate Selection */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Select Estate</label>
                <Select
                  value={estateId}
                  onValueChange={ (value) => {
                    setEstateName(estates.find(estate => estate.EstateID === parseInt(value))?.EstateName || '');
                    handleEstateChange(value);
                    console.log(estateName);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Estate" />
                  </SelectTrigger>
                  <SelectContent>
                    {estates.map((estate) => (
                      <SelectItem key={estate.EstateID} value={estate.EstateID.toString()}>
                        {estate.EstateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Selection */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Filter by Status</label>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      {startDate ? (
                        format(new Date(startDate), "PPP")
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(startDate) : undefined}
                      onSelect={(date) => setStartDate(date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      {endDate ? (
                        format(new Date(endDate), "PPP")
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate ? new Date(endDate) : undefined}
                      onSelect={(date) => setEndDate(date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Input */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Search LPOs</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by LPO number or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Fetch Button */}
              <Button
                onClick={fetchLPOs}
                className="bg-primary hover:bg-primary/90"
                disabled={!estateId || loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Fetch LPOs
                  </>
                )}
              </Button>
              
              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                  setStatus('all');
                }}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LPO Number</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                </TableRow>
              ))
            ) : lpos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No LPOs found. Try adjusting your filters or create a new LPO.
                </TableCell>
              </TableRow>
            ) : (
              lpos.map((lpo) => (
                <React.Fragment key={lpo.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => toggleExpandRow(lpo.id)}
                  >
                    <TableCell className="font-medium">{lpo.id}</TableCell>
                    <TableCell>{formatDate(lpo.dateRaised)}</TableCell>
                    <TableCell>{lpo.createdBy}</TableCell>
                    <TableCell>{lpo.item.name}</TableCell>
                    <TableCell>{lpo.quantityRequested}</TableCell>
                    <TableCell>{formatCurrency(lpo.amountRequested)}</TableCell>
                    <TableCell>{getStatusBadge(lpo.status)}</TableCell>
                    <TableCell>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          expandedRow === lpo.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                  
                  {expandedRow === lpo.id && (
                    <TableRow className="animate-in fade-in-0 duration-300">
                      <TableCell colSpan={8} className="p-0 border-b">
                        <div className="overflow-hidden transition-all duration-300 ease-in-out" 
                             style={{ maxHeight: expandedRow === lpo.id ? '2000px' : '0' }}>
                          <div className="bg-muted/20 p-4">
                            {lpoDetails ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left Column - Basic LPO Details */}
                                <Card className="shadow-sm">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">LPO Details</CardTitle>
                                    <CardDescription>Basic information about this LPO</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div className="font-medium">LPO ID:</div>
                                      <div>{lpoDetails.lpo.id}</div>
                                      
                                      <div className="font-medium">Status:</div>
                                      <div>{getStatusBadge(lpoDetails.lpo.status)}</div>
                                      
                                      <div className="font-medium">Date Raised:</div>
                                      <div>{formatDate(lpoDetails.lpo.dateRaised)}</div>
                                      
                                      <div className="font-medium">Created By:</div>
                                      <div>{lpoDetails.lpo.createdBy.name} ({lpoDetails.lpo.createdBy.matricule})</div>
                                      
                                      <div className="font-medium">Item:</div>
                                      <div>{lpoDetails.item.name}</div>
                                      
                                      <div className="font-medium">Quantity:</div>
                                      <div>{lpoDetails.lpo.quantityRequested} {lpoDetails.item.measuringUnit.symbol}</div>
                                      
                                      <div className="font-medium">Unit Price:</div>
                                      <div>{formatCurrency(lpoDetails.lpo.externalUnitCost)}</div>
                                      
                                      <div className="font-medium">Total Amount:</div>
                                      <div className="font-bold">{formatCurrency(lpoDetails.lpo.amountRequested)}</div>
                                      
                                      <div className="font-medium">Requisition ID:</div>
                                      <div>{lpoDetails.requisition.id}</div>
                                      
                                      <div className="font-medium">Requisition Date:</div>
                                      <div>{formatDate(lpoDetails.requisition.dateRaised)}</div>
                                      
                                      <div className="font-medium">Requisition By:</div>
                                      <div>{lpoDetails.requisition.raisedBy.name} ({lpoDetails.requisition.raisedBy.matricule})</div>
                                      
                                      {lpoDetails.lpo.comment && (
                                        <>
                                          <div className="font-medium">Comment:</div>
                                          <div className="col-span-1">{lpoDetails.lpo.comment}</div>
                                        </>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Right Column - Budget Information */}
                                <Card className="shadow-sm">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Budget Information</CardTitle>
                                    <CardDescription>Budget impact and price comparison</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {/* Budget Line Info */}
                                      <div className="mb-4">
                                        <h4 className="font-semibold mb-2">Budget Line</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div className="font-medium">Budget Line:</div>
                                          <div>{lpoDetails.budgetLine.name}</div>
                                          
                                          <div className="font-medium">Cost Unit:</div>
                                          <div>{lpoDetails.budgetLine.costUnit.name} ({lpoDetails.budgetLine.costUnit.code})</div>
                                          
                                          <div className="font-medium">Cost Center:</div>
                                          <div>{lpoDetails.budgetLine.costUnit.costCenter.name}</div>
                                          
                                          <div className="font-medium">Estate:</div>
                                          <div>{lpoDetails.budgetLine.budget.estate.name} ({lpoDetails.budgetLine.budget.estate.symbol})</div>
                                          
                                          <div className="font-medium">Budget Year:</div>
                                          <div>{lpoDetails.budgetLine.budget.year}</div>
                                        </div>
                                      </div>
                                      
                                      {/* Price Comparison */}
                                      <div className="mb-4">
                                        <h4 className="font-semibold mb-2">Price Comparison</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div className="font-medium">Internal Unit Cost:</div>
                                          <div>{formatCurrency(lpoDetails.priceComparison.internalUnitCost)}</div>
                                          
                                          <div className="font-medium">External Unit Cost:</div>
                                          <div>{formatCurrency(lpoDetails.priceComparison.externalUnitCost)}</div>
                                          
                                          <div className="font-medium">Price Difference:</div>
                                          <div>{formatCurrency(lpoDetails.priceComparison.priceDifference)}</div>
                                          
                                          <div className="font-medium">Variance:</div>
                                          <div className={lpoDetails.priceComparison.isExternalPriceHigher ? "text-red-500" : "text-green-500"}>
                                            {lpoDetails.priceComparison.priceVariancePercentage.toFixed(2)}%
                                            {lpoDetails.priceComparison.isExternalPriceHigher ? " higher" : " lower"}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Budget Impact */}
                                      <div>
                                        <h4 className="font-semibold mb-2">Budget Impact</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div className="font-medium">LPO Amount:</div>
                                          <div>{formatCurrency(lpoDetails.budgetImpact.lpoAmount)}</div>
                                          
                                          <div className="font-medium">Total Budget:</div>
                                          <div>{formatCurrency(lpoDetails.budgetImpact.totalBudgetedAmount)}</div>
                                          
                                          <div className="font-medium">Current Month Budget:</div>
                                          <div>{formatCurrency(lpoDetails.budgetImpact.currentMonthBudget)}</div>
                                          
                                          <div className="font-medium">Impact on Total Budget:</div>
                                          <div>{lpoDetails.budgetImpact.impactOnTotalBudget.toFixed(2)}%</div>
                                          
                                          <div className="font-medium">Impact on Monthly Budget:</div>
                                          <div className={lpoDetails.budgetImpact.impactOnMonthlyBudget > 100 ? "text-red-500 font-bold" : ""}>
                                            {lpoDetails.budgetImpact.impactOnMonthlyBudget.toFixed(2)}%
                                          </div>
                                          
                                          <div className="font-medium">Available Budget:</div>
                                          <div>{formatCurrency(lpoDetails.budgetImpact.availableBudget)}</div>
                                          
                                          <div className="font-medium">Available Monthly Budget:</div>
                                          <div>{formatCurrency(lpoDetails.budgetImpact.availableMonthlyBudget)}</div>
                                          
                                          <div className="font-medium">Projected Monthly Budget:</div>
                                          <div className={lpoDetails.budgetImpact.projectedAvailableMonthlyBudget < 0 ? "text-red-500 font-bold" : ""}>
                                            {formatCurrency(lpoDetails.budgetImpact.projectedAvailableMonthlyBudget)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Monthly Budget Data */}
                                <Card className="shadow-sm md:col-span-2">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Monthly Budget Utilization</CardTitle>
                                    <CardDescription>Budget utilization by month</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-b">
                                            <th className="text-left py-2 px-2">Month</th>
                                            <th className="text-right py-2 px-2">Budget Amount (FCFA)</th>
                                            <th className="text-right py-2 px-2">Budgeted Quantity ({lpoDetails.item.measuringUnit.symbol})</th>
                                            <th className="text-right py-2 px-2">Expenditure (FCFA)</th>
                                            <th className="text-right py-2 px-2">Remaining Budget(FCFA)</th>
                                            <th className="text-right py-2 px-2">Utilization (FCFA %)</th>
                                            {lpoDetails.monthlyData.some(m => m.isCurrentMonth) && (
                                              <th className="text-right py-2 px-2">Projected (FCFA %)</th>
                                            )}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {lpoDetails.monthlyData.map((month, index) => (
                                            <tr key={index} className={`border-b ${month.isCurrentMonth ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}>
                                              <td className="py-2 px-2 font-medium">
                                                {month.month} {month.year}
                                                {month.isCurrentMonth && <span className="ml-1 text-xs bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">Current</span>}
                                              </td>
                                              <td className="text-right py-2 px-2">{formatCurrency(month.budgetedAmount)}</td>
                                              <td className="text-right py-2 px-2">{month.budgetedQuantity} {lpoDetails.item.measuringUnit.symbol}</td>
                                              <td className="text-right py-2 px-2">{formatCurrency(month.totalExpenditureAmount)}</td>
                                              <td className="text-right py-2 px-2">{formatCurrency(month.remainingBudget)}</td>
                                              <td className="text-right py-2 px-2">
                                                <div className="flex items-center justify-end">
                                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                      className={`h-2 rounded-full ${
                                                        month.utilizationPercentage > 90 ? "bg-red-500" : 
                                                        month.utilizationPercentage > 70 ? "bg-yellow-500" : "bg-green-500"
                                                      }`}
                                                      style={{ width: `${Math.min(100, month.utilizationPercentage)}%` }}
                                                    ></div>
                                                  </div>
                                                  {month.utilizationPercentage.toFixed(1)}%
                                                </div>
                                              </td>
                                              {lpoDetails.monthlyData.some(m => m.isCurrentMonth) && (
                                                <td className="text-right py-2 px-2">
                                                  {month.isCurrentMonth ? (
                                                    <div className="flex items-center justify-end">
                                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div 
                                                          className={`h-2 rounded-full ${
                                                            month.projectedUtilizationWithCurrentLPO > 100 ? "bg-red-500" : 
                                                            month.projectedUtilizationWithCurrentLPO > 90 ? "bg-yellow-500" : "bg-green-500"
                                                          }`}
                                                          style={{ width: `${Math.min(100, month.projectedUtilizationWithCurrentLPO)}%` }}
                                                        ></div>
                                                      </div>
                                                      {month.projectedUtilizationWithCurrentLPO.toFixed(1)}%
                                                    </div>
                                                  ) : (
                                                    "-"
                                                  )}
                                                </td>
                                              )}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Actions */}
                                <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                                  {canManageLPOs() && (
                                    <Card className="shadow-sm flex-1">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Actions</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                          {lpoDetails.lpo.status === 'Pending' && (
                                            <>
                                              <Button 
                                                onClick={(e) => initiateApproveLPO(e, lpo.id)}
                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                              >
                                                Approve LPO
                                              </Button>
                                              
                                              <Button 
                                                onClick={(e) => initiateCancelLPO(e, lpo.id)}
                                                className="bg-red-600 hover:bg-red-700 flex-1"
                                              >
                                                Cancel LPO
                                              </Button>
                                            </>
                                          )}
                                          
                                          {lpoDetails.lpo.status === 'Approved' && (
                                            <>
                                              <Button 
                                                onClick={(e) => initiateCompleteLPO(e, lpo.id)}
                                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                              >
                                                Mark as Completed
                                              </Button>
                                              
                                              <Button 
                                                onClick={(e) => initiateCancelLPO(e, lpo.id)}
                                                className="bg-red-600 hover:bg-red-700 flex-1"
                                              >
                                                Cancel LPO
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                  
                                  {canViewLPOs() && (
                                    <Card className="shadow-sm flex-1">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Documents</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                          <LpoPdfGenerator lpoDetails={lpoDetails} estateName={estateName} lpoId={lpo.id} />
                                          
                                          <Button 
                                            variant="outline"
                                            className="flex-1"
                                          >
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Requisition
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center p-8">
                                <div className="flex flex-col items-center">
                                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                                  <p>Loading LPO details...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && <PaginationEllipsis />}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'cancel' && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Reason for cancellation (optional)</label>
              <textarea
                placeholder="Enter reason for cancellation"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingLPO}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedAction}
              disabled={processingLPO}
              className={
                actionType === 'approve' ? "bg-green-600 hover:bg-green-700" :
                actionType === 'complete' ? "bg-blue-600 hover:bg-blue-700" :
                actionType === 'cancel' ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {processingLPO ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                actionType ? `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}` : "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default ViewLPOs; 