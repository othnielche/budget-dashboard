import React, { useState, useEffect, useContext, useRef } from 'react'

import API from '@/lib/axios';

import { AuthContext } from "@/contexts/authContext";

// Import your own table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter, TableCaption } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Fuse from 'fuse.js';
import { toast } from 'sonner';

// Import the AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ViewRequisitions() {

    const { user } = useContext(AuthContext);

    const [requisitions, setRequisitions] = useState([]);
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [estates, setEstates] = useState([]);
    const [estateId, setEstateId] = useState('');
    const [users, setUsers] = useState([]);
    const [fuse, setFuse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [budgetLineDetails, setBudgetLineDetails] = useState(null);
    const [loadingBudgetDetails, setLoadingBudgetDetails] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [expenditureHistory, setExpenditureHistory] = useState(null);
    const [yearlyExpenditures, setYearlyExpenditures] = useState(null);
    const [monthlyExpenditures, setMonthlyExpenditures] = useState(null);
    const [externalUnitPrice, setExternalUnitPrice] = useState('');
    const [totalExternalAmount, setTotalExternalAmount] = useState(0);
    const [lpoComments, setLpoComments] = useState('');
    const [raisingLPO, setRaisingLPO] = useState(false);
    const [lpoRaised, setLpoRaised] = useState(false);
    
    // Status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Forwarded', label: 'Forwarded' },
        { value: 'Completed', label: 'Completed' }
    ];

    const [actionType, setActionType] = useState(null);
    const [selectedRequisitionId, setSelectedRequisitionId] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
    const [confirmDialogTitle, setConfirmDialogTitle] = useState('');

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

    // Fetch requisitions based on selected estate and status
    const fetchRequisitions = async () => {
        if (!estateId) return;
        
        setLoading(true);
        try {
            const response = await API.get('/requisition/by-estate-and-status', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                params: { 
                    page: currentPage, 
                    limit: 10, 
                    estateId, 
                    status: status === 'all' ? '' : status // Convert 'all' back to empty string for API
                }
            });
            
            console.log("Requisitions response:", response.data);
            setRequisitions(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change for pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchRequisitions();
    };

    // Add getUsers function
    const getUsers = async () => {
        try {
            const response = await API.get("/auth/get-all-users", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Add useEffect to fetch users on component mount
    useEffect(() => {
        getUsers();
    }, [user.token]);

    // Helper function to get user name
    const getUserName = (userId) => {
        const foundUser = users.find(user => user.UserID === userId);
        return foundUser ? foundUser.Name : 'N/A';
    };

    // Modify the Fuse.js setup
    useEffect(() => {
        if (requisitions.length > 0) {
            // Create searchable data with user names included
            const searchableData = requisitions.map(req => ({
                ...req,
                // Add the user name as a searchable field
                RaisedByName: getUserName(req.RaisedBy)
            }));

            const fuseOptions = {
                keys: [
                    'RequisitionID',
                    'Item.ItemName',
                    'Item.ItemCode',
                    'Status',
                    'RaisedBy',           // Search by user ID
                    'RaisedByName'        // Search by user name
                ],
                threshold: 0.4,
                includeScore: true,
                ignoreLocation: true,
                useExtendedSearch: true
            };
            
            const fuse = new Fuse(searchableData, fuseOptions);
            setFuse(fuse);
        }
    }, [requisitions, users]);
    // Modify the search function to preserve the original requisition data
    const handleSearch = (term) => {
        if (!term.trim()) {
            fetchRequisitions();
            return;
        }
        
        if (fuse && requisitions.length > 0) {
            const results = fuse.search(term);
            if (results.length > 0) {
                // Map back to original requisition objects
                const searchResults = results.map(result => {
                    // Get the original requisition object without the added RaisedByName field
                    const { RaisedByName, ...originalRequisition } = result.item;
                    return originalRequisition;
                });
                setRequisitions(searchResults);
            } else {
                setRequisitions([]);
            }
        }
    };
    
    // Add reset search function
    const resetSearch = () => {
        setSearchTerm('');
        fetchRequisitions();
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 0);
    };
    
    // Add debounced search effect
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            } else if (searchTerm === '') {
                fetchRequisitions();
            }
        }, 300);
        
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    // Add search input handler
    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Function to fetch budget line details and expenditure history
    const fetchBudgetLineDetails = async (requisitionId) => {
        setLoadingBudgetDetails(true);
        try {
            // Find the current requisition from our state
            const currentRequisition = requisitions.find(req => req.RequisitionID === requisitionId);
            
            if (!currentRequisition || !currentRequisition.BudgetLineID) {
                toast.error("Budget line information not available");
                return;
            }
            
            // Use the budget line ID from the requisition
            const budgetLineId = currentRequisition.BudgetLineID;
            
            // Calculate budget utilization from existing requisitions
            const relatedRequisitions = requisitions.filter(req => 
                req.BudgetLineID === budgetLineId
            );
            
            // Calculate total amount requested for this budget line
            const totalRequested = relatedRequisitions.reduce((sum, req) => 
                sum + parseFloat(req.AmountRequested || 0), 0
            );
            
            // Calculate pending amount (only from pending requisitions)
            const pendingAmount = relatedRequisitions
                .filter(req => req.Status === 'Pending')
                .reduce((sum, req) => sum + parseFloat(req.AmountRequested || 0), 0);
            
            // Calculate approved amount
            const approvedAmount = relatedRequisitions
                .filter(req => req.Status === 'Approved')
                .reduce((sum, req) => sum + parseFloat(req.AmountRequested || 0), 0);
            
            // Calculate forwarded amount
            const forwardedAmount = relatedRequisitions
                .filter(req => req.Status === 'Forwarded')
                .reduce((sum, req) => sum + parseFloat(req.AmountRequested || 0), 0);
            
            // Calculate remaining budget
            const totalBudget = parseFloat(currentRequisition.BudgetLine?.TotalBudgetedAmount || 0);
            const remainingBudget = totalBudget - approvedAmount;
            
            // Calculate utilization percentage
            const utilizationPercentage = totalBudget > 0 
                ? (approvedAmount / totalBudget) * 100 
                : 0;
            
            // Set budget details
            const budgetDetails = {
                budgetLine: currentRequisition.BudgetLine,
                totalBudget: totalBudget,
                approvedAmount: approvedAmount,
                pendingAmount: pendingAmount,
                forwardedAmount: forwardedAmount,
                remainingBudget: remainingBudget,
                utilizationPercentage: utilizationPercentage,
                relatedRequisitions: relatedRequisitions
            };
            
            setBudgetLineDetails(budgetDetails);
            
            console.log(budgetLineId);
            console.log(budgetLineDetails);
            // Try to fetch additional expenditure data if the endpoint exists
            try {
                // Get current year for the query parameter
                const currentYear = new Date().getFullYear();
                console.log('i am in the console')
                
                const expenditureResponse = await API.get(`/requisition/budget-line-expenditure/${budgetLineId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    },
                    params: {
                        year: currentYear // Add the year parameter required by the backend
                    }
                });
                if (expenditureResponse.status === 200) {
                    console.log(`expeditureResponse: ${expenditureResponse.data.monthlyData[0].month}`);
                    
                    // Update budget details with expenditure data if available
                    setBudgetLineDetails(prev => ({
                    ...prev,
                    expenditureData: expenditureResponse.data
                }));
                }
                
            } catch (error) {
                console.log("Budget expenditure endpoint not available yet:", error);
                // We already set basic details, so we can continue
            }
            
        } catch (error) {
            console.error("Error processing budget details:", error);
            toast.error("Failed to process budget details");
        } finally {
            setLoadingBudgetDetails(false);
        }
    };
    
    // Toggle row expansion
    const toggleRowExpansion = (requisitionId) => {
        if (expandedRow === requisitionId) {
            setExpandedRow(null);
            setBudgetLineDetails(null);
            setShowRejectionInput(false);
            setRejectionReason('');
        } else {
            setExpandedRow(requisitionId);
            fetchBudgetLineDetails(requisitionId);
        }
    };
    
    // Add a helper function to check if user is an admin
    const isAdmin = () => {
        return user && user.roleCode === 1;
    };

    // Update the useEffect for status filtering to exempt admins
    useEffect(() => {
        // If user has usercode 5 and is not an admin, restrict to only forwarded requisitions
        if (user && user.roleCode === 5 && !isAdmin()) {
            setStatus('Forwarded');
        }
    }, [user]);

    // Update the status dropdown to be disabled only for non-admin usercode 5
    <div className="col-span-2">
        <label className="text-sm font-medium mb-1 block">Filter by Status</label>
        <Select
            value={status}
            onValueChange={(value) => setStatus(value)}
            disabled={user && user.roleCode === 5 && !isAdmin()} // Only disable for non-admin usercode 5
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

    // Update the canManageRequisitions function to include admins
    const canManageRequisitions = () => {
        // Allow admins (roleCode 1) or users with appropriate permissions
        return isAdmin() || (user && (user.roleCode === 2 || user.roleCode === 3 || user.roleCode === 4));
    };

    // Handle requisition approval
    const handleApproveRequisition = async (requisitionId) => {
        try {
            const response = await API.put('/requisition/approve', 
                { requisitionId },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }
            );
            console.log(response);
            toast.success("Requisition approved successfully");
            fetchRequisitions();
        } catch (error) {
            console.error("Error approving requisition:", error);
            toast.error("Failed to approve requisition");
        }
    };
    
    // Handle requisition rejection
    const handleRejectRequisition = async (requisitionId) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        
        try {
            await API.put(`/requisition/reject/${requisitionId}`, 
                { rejectionReason },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }
            );
            toast.success("Requisition rejected successfully");
            setRejectionReason('');
            setShowRejectionInput(false);
            fetchRequisitions();
        } catch (error) {
            console.error("Error rejecting requisition:", error);
            toast.error("Failed to reject requisition");
        }
    };
    
    // Handle requisition forwarding
    const handleForwardRequisition = async (requisitionId) => {
        try {
            const response = await API.put(`/requisition/forward/${requisitionId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            console.log(response);
            if (response.status === 200) {
                toast.success("Requisition forwarded successfully");
            fetchRequisitions();
            } else {
                toast.error("Failed to forward requisition");
            }
        } catch (error) {
            console.error("Error forwarding requisition:", error);
            toast.error("Failed to forward requisition");
        }
    };

    // Add a function to handle raising an LPO
    const handleRaiseLPO = async (requisitionId, externalUnitPrice, comments) => {
        setRaisingLPO(true);
        try {
            const response = await API.post('/lpo/create-lpo', 
                { 
                    requisitionId,
                    externalUnitCost: parseFloat(externalUnitPrice),
                    comments
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }
            );
            
            if (response.status === 200) {
                toast.success("LPO raised successfully");
                setExternalUnitPrice('');
                setLpoComments('');
                setLpoRaised(true);
                
                // Reset the success state after 3 seconds
                setTimeout(() => {
                    setLpoRaised(false);
                }, 3000);
                
                fetchRequisitions();
            } else {
                toast.error("Failed to raise LPO");
            }
        } catch (error) {
            console.error("Error raising LPO:", error);
            toast.error("Failed to raise LPO");
        } finally {
            setRaisingLPO(false);
        }
    };

    // Update the action handlers to show confirmation dialogs
    const initiateApproveRequisition = (e, requisitionId) => {
        e.stopPropagation();
        setActionType('approve');
        setSelectedRequisitionId(requisitionId);
        setConfirmDialogTitle('Approve Requisition');
        setConfirmDialogMessage('Are you sure you want to approve this requisition? This action cannot be undone.');
        setShowConfirmDialog(true);
    };

    const initiateForwardRequisition = (e, requisitionId) => {
        e.stopPropagation();
        setActionType('forward');
        setSelectedRequisitionId(requisitionId);
        setConfirmDialogTitle('Forward Requisition');
        setConfirmDialogMessage('Are you sure you want to forward this requisition for higher approval? This action cannot be undone.');
        setShowConfirmDialog(true);
    };

    const initiateRejectRequisition = (e, requisitionId) => {
        e.stopPropagation();
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setActionType('reject');
        setSelectedRequisitionId(requisitionId);
        setConfirmDialogTitle('Reject Requisition');
        setConfirmDialogMessage(`Are you sure you want to reject this requisition with reason: "${rejectionReason}"? This action cannot be undone.`);
        setShowConfirmDialog(true);
    };

    const initiateRaiseLPO = (e, requisitionId, externalUnitPrice, comments) => {
        e.stopPropagation();
        if (!externalUnitPrice) {
            toast.error("Please enter an external unit price");
            return;
        }
        setActionType('raiseLPO');
        setSelectedRequisitionId(requisitionId);
        setConfirmDialogTitle('Raise LPO');
        setConfirmDialogMessage(`Are you sure you want to raise an LPO for this requisition with an external unit price of ${parseFloat(externalUnitPrice).toLocaleString()} FCFA? This action cannot be undone.`);
        setShowConfirmDialog(true);
    };

    // Function to handle confirmed actions
    const handleConfirmedAction = async () => {
        switch (actionType) {
            case 'approve':
                await handleApproveRequisition(selectedRequisitionId);
                break;
            case 'forward':
                await handleForwardRequisition(selectedRequisitionId);
                break;
            case 'reject':
                await handleRejectRequisition(selectedRequisitionId);
                break;
            case 'raiseLPO':
                await handleRaiseLPO(selectedRequisitionId, externalUnitPrice, lpoComments);
                break;
            default:
                break;
        }
        setShowConfirmDialog(false);
    };

    return (
        <>
            <Card className="">
                <h3 className='mb-4 font-bold text-xl p-4'>View Requisitions</h3>
                
                <div className="grid grid-cols-12 gap-4 mb-6 p-4">
                    {/* Estate Selection */}
                    <div className="col-span-3">
                        <label className="text-sm font-medium mb-1 block">Select Estate</label>
                        <Select
                            value={estateId}
                            onValueChange={(value) => setEstateId(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an Estate" />
                            </SelectTrigger>
                            <SelectContent>
                                {estates.map((estate) => (
                                    <SelectItem key={estate.EstateID} value={estate.EstateID}>
                                        {estate.EstateName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Add Search Input */}
                    <div className="col-span-5">
                        <label className="text-sm font-medium mb-1 block">Search Requisitions</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by ID, item, status, or raised by..."
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
                    </div>
                    
                    {/* Status Selection */}
                    <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">Filter by Status</label>
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value)}
                            disabled={user && user.roleCode === 5 && !isAdmin()} // Only disable for non-admin usercode 5
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
                    
                    {/* Fetch Button */}
                    <div className="col-span-2 flex items-end">
                        <Button 
                            onClick={fetchRequisitions} 
                            disabled={loading || !estateId} 
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Fetch Requisitions
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Raised By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Show loading state
                            Array(5).fill(0).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell colSpan={8}>
                                        <Skeleton className="h-10 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : requisitions.length > 0 ? (
                            // Show requisition data with expandable rows
                            requisitions.map((req) => (
                                <React.Fragment key={req.RequisitionID}>
                                    <TableRow 
                                        className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                                            expandedRow === req.RequisitionID ? 'bg-muted/50' : ''
                                        }`}
                                        onClick={() => {
                                            toggleRowExpansion(req.RequisitionID);
                                            setRejectionReason('');
                                        }}
                                    >
                                        <TableCell>{req.RequisitionID}</TableCell>
                                        <TableCell>{req.Item?.ItemName || 'N/A'}</TableCell>
                                        <TableCell>{req.QuantityRequested}</TableCell>
                                        <TableCell>{parseFloat(req.Item?.UnitCost || 0).toLocaleString()} FCFA</TableCell>
                                        <TableCell>{parseFloat(req.AmountRequested || 0).toLocaleString()} FCFA</TableCell>
                                        <TableCell>{getUserName(req.RaisedBy)}</TableCell>
                                        <TableCell>
                                            {new Date(req.DataRaised || req.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                req.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                req.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                req.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                req.Status === 'Forwarded' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'

                                            }`}>
                                                {req.Status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                    
                                    {/* Expanded row with budget details */}
                                    {expandedRow === req.RequisitionID && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="p-0 border-b">
                                                <div className="overflow-hidden transition-all duration-300 ease-in-out" 
                                                     style={{ maxHeight: expandedRow === req.RequisitionID ? '2000px' : '0' }}>
                                                    <div className="bg-muted/20 p-4">
                                                        <div className="flex flex-row gap-4">
                                                            {/* Left side - Monthly Budget Breakdown */}
                                                            <div className='w-1/2'>
                                                                <Card className='p-4 h-full'>
                                                                    <h4 className="font-semibold text-sm mb-2">Monthly Budget Breakdown</h4>
                                                                    {budgetLineDetails.expenditureData?.monthlyData ? (
                                                                        <Table className="border-collapse">
                                                                            <TableCaption>Monthly Budget Allocation for {new Date().getFullYear()}</TableCaption>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead className="w-[100px]">Month</TableHead>
                                                                                    <TableHead className="text-right">Budget</TableHead>
                                                                                    <TableHead className="text-right">Expenditure</TableHead>
                                                                                    <TableHead className="text-right">Remaining</TableHead>
                                                                                    <TableHead className="text-right">Utilization</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {budgetLineDetails.expenditureData.monthlyData.map((monthData, index) => {
                                                                                    const currentDate = new Date();
                                                                                    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
                                                                                    const isCurrentMonth = monthData.month === currentMonth && monthData.year === currentDate.getFullYear();
                                                                                    
                                                                                    return (
                                                                                        <TableRow 
                                                                                            key={`${monthData.month}-${monthData.year}`}
                                                                                            className={isCurrentMonth ? "bg-primary/10" : ""}
                                                                                        >
                                                                                            <TableCell className="font-medium">
                                                                                                {isCurrentMonth && <span className="mr-1">▶</span>}
                                                                                                {monthData.month.substring(0, 3)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                {parseFloat(monthData.budgetedAmount || 0).toLocaleString()}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                {parseFloat(monthData.totalExpenditureAmount || 0).toLocaleString()}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                {parseFloat(monthData.remainingBudget || 0).toLocaleString()}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                    monthData.utilizationPercentage > 90 ? 'bg-red-100 text-red-800' :
                                                                                                    monthData.utilizationPercentage > 70 ? 'bg-yellow-100 text-yellow-800' :
                                                                                                    'bg-green-100 text-green-800'
                                                                                                }`}>
                                                                                                    {monthData.utilizationPercentage}%
                                                                                                </span>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                })}
                                                                            </TableBody>
                                                                        </Table>
                                                                    ) : (
                                                                        <div className="text-center py-4 bg-background/50 rounded-lg">
                                                                            Monthly data not available
                                                                        </div>
                                                                    )}
                                                                </Card>
                                                            </div>
                                                            
                                                            {/* Right side - Budget Information and Actions */}
                                                            <div className='flex flex-col w-1/2 space-y-4'>
                                                                {/* Budget Line Information */}
                                                                <Card className='p-4'>
                                                                    <h4 className="font-semibold text-sm mb-2">Budget Line Information</h4>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div className="font-medium">Budget Line:</div>
                                                                        <div>{budgetLineDetails.expenditureData?.budgetLine?.id || budgetLineDetails.budgetLine?.BudgetLineName || 'N/A'}</div>
                                                                        
                                                                        <div className="font-medium">Total Budget:</div>
                                                                        <div>{parseFloat(budgetLineDetails.expenditureData?.budgetLine?.totalBudgetedAmount || budgetLineDetails.budgetLine?.TotalBudgetedAmount || 0).toLocaleString()} FCFA</div>
                                                                        
                                                                        <div className="font-medium">Available Budget:</div>
                                                                        <div>{parseFloat(budgetLineDetails.expenditureData?.availableBudget || 0).toLocaleString()} FCFA</div>
                                                                        
                                                                        <div className="font-medium">Budget Year:</div>
                                                                        <div>{budgetLineDetails.expenditureData?.budgetLine?.year || new Date().getFullYear()}</div>
                                                                        
                                                                        <div className="font-medium">Cost Unit:</div>
                                                                        <div>{budgetLineDetails.expenditureData?.budgetLine?.costUnit?.name || 'N/A'}</div>
                                                                    </div>
                                                                </Card>
                                                                
                                                                {/* Budget Impact Analysis */}
                                                                <Card className='p-4'>
                                                                    <h4 className="font-semibold text-sm mb-2">Budget Impact Analysis</h4>
                                                                    <div className="text-sm">
                                                                        {(() => {
                                                                            // Get current date and month
                                                                            const currentDate = new Date();
                                                                            const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
                                                                            
                                                                            // Find current month data
                                                                            const currentMonthData = budgetLineDetails.expenditureData?.monthlyData?.find(
                                                                                m => m.month === currentMonth && m.year === currentDate.getFullYear()
                                                                            );
                                                                            
                                                                            const requisitionAmount = parseFloat(req.AmountRequested || 0);
                                                                            const availableBudget = parseFloat(budgetLineDetails.expenditureData?.availableBudget || 0);
                                                                            const monthlyBudget = parseFloat(currentMonthData?.remainingBudget || 0);
                                                                            
                                                                            let impactAnalysis = '';
                                                                            let impactClass = '';
                                                                            
                                                                            // Different analysis based on requisition status
                                                                            if (req.Status === 'Approved' || req.Status === 'Completed') {
                                                                                // For approved/completed requisitions
                                                                                impactAnalysis = `✓ This requisition has been approved and recorded as an expenditure of ${requisitionAmount.toLocaleString()} FCFA against the budget.`;
                                                                                impactClass = 'text-blue-600 font-medium';
                                                                            } else if (req.Status === 'Rejected') {
                                                                                // For rejected requisitions
                                                                                impactAnalysis = `✗ This requisition was rejected and has no impact on the budget.`;
                                                                                impactClass = 'text-gray-600 font-medium';
                                                                            } else if (req.Status === 'Forwarded') {
                                                                                // For forwarded requisitions
                                                                                impactAnalysis = `→ This requisition has been forwarded for higher approval and is pending final decision.`;
                                                                                impactClass = 'text-purple-600 font-medium';
                                                                            } else {
                                                                                // For pending requisitions - original analysis logic
                                                                                if (requisitionAmount > availableBudget) {
                                                                                    impactAnalysis = `⚠️ Warning: This requisition exceeds the available budget by ${(requisitionAmount - availableBudget).toLocaleString()} FCFA. Approving this requisition will result in a budget overrun.`;
                                                                                    impactClass = 'text-red-600 font-medium';
                                                                                } else if (requisitionAmount > monthlyBudget && currentMonthData) {
                                                                                    impactAnalysis = `⚠️ Note: This requisition exceeds the current month's remaining budget by ${(requisitionAmount - monthlyBudget).toLocaleString()} FCFA, but is within the total available budget. Consider if this expense can be deferred to a future month.`;
                                                                                    impactClass = 'text-amber-600 font-medium';
                                                                                } else {
                                                                                    impactAnalysis = `✅ This requisition is within budget limits. After approval, the remaining budget will be ${(availableBudget - requisitionAmount).toLocaleString()} FCFA.`;
                                                                                    impactClass = 'text-green-600 font-medium';
                                                                                }
                                                                            }
                                                                            
                                                                            return <p className={impactClass}>{impactAnalysis}</p>;
                                                                        })()}
                                                                    </div>
                                                                </Card>
                                                                
                                                                {/* Requisition Comments - New Section */}
                                                                {req.Comment && (
                                                                    <Card className='p-4'>
                                                                        <h4 className="font-semibold text-sm mb-2">Requisition Comments</h4>
                                                                        <div className="text-sm bg-muted/30 p-3 rounded-md">
                                                                            <p className="italic">{req.Comment}</p>
                                                                        </div>
                                                                    </Card>
                                                                )}

                                                                {/* Rejection Reason - New Section */}
                                                                {req.Status === 'Rejected' && req.RejectionReason && (
                                                                    <Card className='p-4'>
                                                                        <h4 className="font-semibold text-sm mb-2 text-red-600">Rejection Reason</h4>
                                                                        <div className="text-sm bg-red-50 p-3 rounded-md border-l-4 border-red-400">
                                                                            <p className="text-red-700">{req.RejectionReason}</p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                Rejected on: {new Date(req.DataClosed || req.updatedAt).toLocaleString('en-GB', {
                                                                                    day: '2-digit',
                                                                                    month: '2-digit',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">Rejected by: {getUserName(req.ClosedBy)}</p>
                                                                        </div>
                                                                    </Card>
                                                                )}

                                                                {/* Action buttons based on user role and requisition status */}
                                                                {req.Status === 'Pending' && (canManageRequisitions()) && (
                                                                    <Card className='p-4'>
                                                                        <h4 className="font-semibold text-sm mb-2">Actions</h4>
                                                                        <div className="flex flex-col space-y-3">
                                                                            <div className="flex space-x-2">
                                                                                <Button 
                                                                                    onClick={(e) => initiateApproveRequisition(e, req.RequisitionID)}
                                                                                    className="bg-green-600 hover:bg-green-700 w-1/2"
                                                                                >
                                                                                    Approve Requisition
                                                                                </Button>
                                                                                
                                                                                <Button 
                                                                                    onClick={(e) => initiateForwardRequisition(e, req.RequisitionID)}
                                                                                    className="bg-blue-600 hover:bg-blue-700 w-1/2"
                                                                                >
                                                                                    Forward Requisition
                                                                                </Button>
                                                                            </div>
                                                                            
                                                                            <div className="flex space-x-2">
                                                                                <Input
                                                                                    placeholder="Reason for rejection"
                                                                                    value={rejectionReason}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setRejectionReason(e.target.value);
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="flex-1"
                                                                                />
                                                                                <Button 
                                                                                    onClick={(e) => initiateRejectRequisition(e, req.RequisitionID)}
                                                                                    className="bg-red-600 hover:bg-red-700"
                                                                                    disabled={!rejectionReason.trim()}
                                                                                >
                                                                                    Reject
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                )}

                                                                {/* LPO button for usercode 5 and admins when viewing forwarded requisitions */}
                                                                {req.Status === 'Forwarded' && (user.roleCode === 5 || isAdmin()) && (
                                                                    <Card className='p-4'>
                                                                        <h4 className="font-semibold text-sm mb-2">Actions</h4>
                                                                        <div className="flex flex-col space-y-3">
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <label className="text-sm font-medium mb-1 block">External Unit Price (FCFA)</label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        placeholder="Enter unit price"
                                                                                        value={externalUnitPrice || ''}
                                                                                        onChange={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setExternalUnitPrice(e.target.value);
                                                                                        }}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="w-full"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="text-sm font-medium mb-1 block">Total Amount</label>
                                                                                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm flex items-center">
                                                                                        {externalUnitPrice 
                                                                                            ? (parseFloat(externalUnitPrice) * parseFloat(req.QuantityRequested || 1)).toLocaleString() 
                                                                                            : '0'} FCFA
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div>
                                                                                <label className="text-sm font-medium mb-1 block">Additional Comments</label>
                                                                                <textarea
                                                                                    placeholder="Enter any additional information for the LPO"
                                                                                    value={lpoComments || ''}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setLpoComments(e.target.value);
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                                                                                />
                                                                            </div>
                                                                            
                                                                            <Button 
                                                                                onClick={(e) => initiateRaiseLPO(e, req.RequisitionID, externalUnitPrice, lpoComments)}
                                                                                className={`w-full mt-2 ${
                                                                                    lpoRaised 
                                                                                        ? "bg-green-600 hover:bg-green-700" 
                                                                                        : "bg-purple-600 hover:bg-purple-700"
                                                                                }`}
                                                                                disabled={!externalUnitPrice || raisingLPO}
                                                                            >
                                                                                {raisingLPO ? (
                                                                                    <>
                                                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                        </svg>
                                                                                        Processing...
                                                                                    </>
                                                                                ) : lpoRaised ? (
                                                                                    <>
                                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                                        </svg>
                                                                                        LPO Raised Successfully
                                                                                    </>
                                                                                ) : (
                                                                                    "Raise LPO"
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    </Card>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            // Show empty state
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    {estateId ? 'No requisitions found. Try changing filters or create a new requisition.' : 'Please select an estate to view requisitions.'}
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
                                            <PaginationPrevious 
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            />
                                            <div className="mx-2">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <PaginationNext 
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            />
                                        </PaginationContent>
                                    </Pagination>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialogMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmedAction}
                            className={
                                actionType === 'approve' ? "bg-green-600 hover:bg-green-700" :
                                actionType === 'forward' ? "bg-blue-600 hover:bg-blue-700" :
                                actionType === 'reject' ? "bg-red-600 hover:bg-red-700" :
                                actionType === 'raiseLPO' ? "bg-purple-600 hover:bg-purple-700" :
                                ""
                            }
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default ViewRequisitions;