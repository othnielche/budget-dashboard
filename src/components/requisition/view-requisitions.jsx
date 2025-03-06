import React, { useState, useEffect, useContext, useRef } from 'react'

import API from '@/lib/axios';

import { AuthContext } from "@/contexts/authContext";

// Import your own table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Fuse from 'fuse.js';

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
    
    // Status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
    ];

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
            const response = await API.get('/requisition/get-all-requisitions-by-estate-and-status', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                params: { page: currentPage, limit: 10, estateId, status }
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
    }, [requisitions, users]); // Add users as a dependency since getUserName depends on it

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

    return (
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
                        // Show requisition data
                        requisitions.map((req) => (
                            <TableRow key={req.RequisitionID} className="hover:bg-muted/50 transition-colors">
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
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {req.Status}
                                    </span>
                                </TableCell>
                            </TableRow>
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
    );
}

export default ViewRequisitions;