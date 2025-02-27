import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import API from '@/lib/axios';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableCaption,TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


import Toast from '@/components/ui/sonner';
import API from '@/lib/axios';
import { AuthContext } from '@/contexts/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter } from 'lucide-react';

import { Card, CardTitle } from "../ui/card"


function BudgetLineAdmin() {
  const { user } = useContext(AuthContext);
  const [budgetLines, setBudgetLines] = useState([]);
  const [filteredBudgetLines, setFilteredBudgetLines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [estateId, setEstateId] = useState(null);
  const [year, setYear] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Function to fetch budget lines
  const fetchBudgetLines = async () => {
    try {
      const response = await API.get("/budgetline/get-budget-lines-by-estate", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          estateId,
          year,
          page: currentPage,
          limit: 10,
        },
      });
      const data = response.data;
      setBudgetLines(data.budgetLines);
      setFilteredBudgetLines(data.budgetLines);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  // Function to handle search
  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    const filteredData = budgetLines.filter((budgetLine) => {
      return (
        budgetLine.budgetLineId.toString().includes(searchValue) ||
        budgetLine.budgetId.toString().includes(searchValue) ||
        budgetLine.estateId.toString().includes(searchValue) ||
        budgetLine.budgetYear.toString().includes(searchValue) ||
        budgetLine.totalBudgetedAmount.toString().includes(searchValue) ||
        budgetLine.remainingBudget.toString().includes(searchValue) ||
        budgetLine.budgetLineItems.some((item) => {
          return (
            item.itemId.toString().includes(searchValue) ||
            item.itemName.includes(searchValue) ||
            item.itemDescription.includes(searchValue) ||
            item.itemCode.includes(searchValue)
          );
        })
      );
    });
    setFilteredBudgetLines(filteredData);
  };

  // Function to handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchBudgetLines();
  };

  // Function to handle estateId and year changes
  const handleEstateIdChange = (e) => {
    setEstateId(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  // Use effect to fetch budget lines on mount and when estateId or year changes
  useEffect(() => {
    fetchBudgetLines();
  }, [estateId, year, currentPage]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Budget Line ID</TableHead>
            <TableHead>Budget ID</TableHead>
            <TableHead>Estate ID</TableHead>
            <TableHead>Budget Year</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetLines.map((item) => (
            <React.Fragment key={item.budgetLineId}>
              <TableRow className="cursor-pointer" onClick={() => toggleRow(item.budgetLineId)}>
                <TableCell>{item.budgetLineId}</TableCell>
                <TableCell>{item.budgetId}</TableCell>
                <TableCell>{item.estateId}</TableCell>
                <TableCell>{item.budgetYear}</TableCell>
                <TableCell>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedRow === item.budgetLineId ? "transform rotate-180" : ""
                    }`}
                  />
                </TableCell>
              </TableRow>
              {expandedRow === item.budgetLineId && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Monthly Phasing</h3>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Allocated Budget</th>
                            <th>Remaining Budget</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.monthlyPhasing.map((phasing) => (
                            <tr key={phasing.monthlyPhasingId}>
                              <td>{phasing.month}</td>
                              <td>{phasing.allocatedMonthBudget}</td>
                              <td>{phasing.remainingMonthBudget}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}