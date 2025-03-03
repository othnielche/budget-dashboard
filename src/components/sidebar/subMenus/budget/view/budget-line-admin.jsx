// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '@/contexts/authContext';
// import API from '@/lib/axios';

// import {
//   Pagination,
//   PaginationContent,
//   PaginationPrevious,
//   PaginationNext,
// } from "@/components/ui/pagination";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Card, CardTitle } from "@/components/ui/card";

// function BudgetLineAdmin() {
//   const { user } = useContext(AuthContext);
//   const [budgetLines, setBudgetLines] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [estateId, setEstateId] = useState('');
//   const [year, setYear] = useState('');
//   const [expandedRow, setExpandedRow] = useState(null);

//   const fetchBudgetLines = async () => {
//     if (!estateId || !year) return;
//     setLoading(true);
//     try {
//       const response = await API.get(`/budgetline/get-budget-lines-by-estate`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//         params: { estateId, year, page: currentPage }
//       });
  
//       console.log(response.data);
//       const budgetLines = response.data.Budgets.BudgetLines;
//       const formattedBudgetLines = budgetLines.map((budgetLine) => {
//         return {
//           id: budgetLine.BudgetLineID,
//           totalBudgetedAmount: budgetLine.TotalBudgetedAmount,
//           budgetId: budgetLine.BudgetID,
//           costUnitId: budgetLine.CostUnitID,
//           budgetLineItems: budgetLine.BudgetLineItems.map((budgetLineItem) => {
//             return {
//               id: budgetLineItem.BudgetLineItemID,
//               budgetLineId: budgetLineItem.BudgetLineID,
//               itemId: budgetLineItem.ItemID,
//               item: {
//                 id: budgetLineItem.Item.ItemID,
//                 code: budgetLineItem.Item.ItemCode,
//                 name: budgetLineItem.Item.ItemName,
//                 unitCost: budgetLineItem.Item.UnitCost,
//                 measuringUnitId: budgetLineItem.Item.MeasuringUnitID,
//                 measuringUnit: {
//                   id: budgetLineItem.Item.MeasuringUnit.MeasuringUnitID,
//                   name: budgetLineItem.Item.MeasuringUnit.MeasuringUnitName,
//                   symbol: budgetLineItem.Item.MeasuringUnit.MeasuringUnitSymbol,
//                 },
//               },
//             };
//           }),
//           monthlyPhasings: budgetLine.MonthlyPhasings.map((monthlyPhasing) => {
//             return {
//               id: monthlyPhasing.MonthlyPhasingID,
//               budgetLineId: monthlyPhasing.BudgetLineID,
//               month: monthlyPhasing.Month,
//               allocatedMonthBudget: monthlyPhasing.AllocatedMonthBudget,
//             };
//           }),
//         };
//       });
//       setBudgetLines(formattedBudgetLines);
//       setTotalPages(response.data.totalPages);
//     } catch (error) {
//       console.error("Error fetching budget lines", error);
//     }
//     setLoading(false);
//   };

//   const toggleExpandRow = (id) => {
//     setExpandedRow(expandedRow === id ? null : id);
//   };

//   return (
//     <Card>
//       <CardTitle>Budget Lines</CardTitle>
//       <div className="p-4 flex gap-4">
//         <Input 
//           placeholder="Enter Estate ID"
//           value={estateId}
//           onChange={(e) => setEstateId(e.target.value)}
//         />
//         <Input 
//           placeholder="Enter Year"
//           value={year}
//           onChange={(e) => setYear(e.target.value)}
//         />
//         <Button onClick={fetchBudgetLines} disabled={loading}>Fetch</Button>
//       </div>
//       <ScrollArea>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Budget Line ID</TableHead>
//               <TableHead>Item Unit Cost</TableHead>
//               <TableHead>Measuring Unit</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {budgetLines.map((line) => (
//               <React.Fragment key={line.BudgetLineID}>
//                 <TableRow onClick={() => toggleExpandRow(line.BudgetLineID)}>
//                   <TableCell>{line.BudgetLineID}</TableCell>
//                   <TableCell>{line.BudgetLineItems[0]?.Item?.CostUnit?.CostUnitCode || "N/A"}</TableCell>
//                   <TableCell>{line.BudgetLineItems[0]?.Item?.MeasuringUnit?.MeasuringUnitSymbol || "N/A"}</TableCell>
//                   <TableCell>
//                     <Button variant="outline" onClick={() => toggleExpandRow(line.BudgetLineID)}>
//                       {expandedRow === line.BudgetLineID ? "Collapse" : "Expand"}
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//                 {expandedRow === line.BudgetLineID && (
//                   <TableRow>
//                     <TableCell colSpan={4}>
//                       <div>
//                         <h4>Details</h4>
//                         <p>Total Budgeted Amount: {line.TotalBudgetedAmount}</p>
//                         <p>Budget ID: {line.BudgetID}</p>
//                         <p>Cost Unit ID: {line.CostUnitID}</p>
//                         <h4>Monthly Phasing</h4>
//                         <Table>
//                           <TableBody>
//                             {line.MonthlyPhasing.map((month) => (
//                               <TableRow key={month.MonthlyPhasingID}>
//                                 <TableCell>{month.Month}</TableCell>
//                                 <TableCell>{month.AllocatedMonthBudget}</TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </React.Fragment>
//             ))}
//           </TableBody>
//         </Table>
//       </ScrollArea>
//       <Pagination>
//         <PaginationContent>
//           <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
//           <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
//         </PaginationContent>
//       </Pagination>
//     </Card>
//   );
// }

// export default BudgetLineAdmin;



function BudgetLineAdmin() {
  const { user } = useContext(AuthContext);
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estateId, setEstateId] = useState('');
  const [year, setYear] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

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

      console.log(response.data);
      const budgetLines = response.data.Budgets.BudgetLines;
      const formattedBudgetLines = budgetLines.map((budgetLine) => {
        return {
          id: budgetLine.BudgetLineID,
          totalBudgetedAmount: budgetLine.TotalBudgetedAmount,
          budgetId: budgetLine.BudgetID,
          costUnitId: budgetLine.CostUnitID,
          budgetLineItems: budgetLine.BudgetLineItems.map((budgetLineItem) => {
            return {
              id: budgetLineItem.BudgetLineItemID,
              budgetLineId: budgetLineItem.BudgetLineID,
              itemId: budgetLineItem.ItemID,
              item: {
                id: budgetLineItem.Item.ItemID,
                code: budgetLineItem.Item.ItemCode,
                name: budgetLineItem.Item.ItemName,
                unitCost: budgetLineItem.Item.UnitCost,
                measuringUnitId: budgetLineItem.Item.MeasuringUnitID,
                measuringUnit: {
                  id: budgetLineItem.Item.MeasuringUnit.MeasuringUnitID,
                  name: budgetLineItem.Item.MeasuringUnit.MeasuringUnitName,
                  symbol: budgetLineItem.Item.MeasuringUnit.MeasuringUnitSymbol,
                },
              },
            };
          }),
          monthlyPhasings: budgetLine.MonthlyPhasings.map((monthlyPhasing) => {
            return {
              id: monthlyPhasing.MonthlyPhasingID,
              budgetLineId: monthlyPhasing.BudgetLineID,
              month: monthlyPhasing.Month,
              allocatedMonthBudget: monthlyPhasing.AllocatedMonthBudget,
            };
          }),
        };
      });
      setBudgetLines(formattedBudgetLines);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching budget lines", error);
    }
    setLoading(false);
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <Card>
      <CardTitle>Budget Lines</CardTitle>
      <div className="p-4 flex gap-4">
        <Input 
          placeholder="Enter Estate ID"
          value={estateId}
          onChange={(e) => setEstateId(e.target.value)}
        />
        <Input 
          placeholder="Enter Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <Button onClick={fetchBudgetLines} disabled={loading}>Fetch</Button>
      </div>
      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget Line ID</TableHead>
              <TableHead>Total Budgeted Amount</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Monthly Phasings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetLines.map((budgetLine) => (
              <TableRow key={budgetLine.id}>
                <TableCell>{budgetLine.id}</TableCell>
                <TableCell>{budgetLine.totalBudgetedAmount}</TableCell>
                <TableCell>
                  <Button onClick={() => toggleExpandRow(budgetLine.id)}>View Items</Button>
                  {expandedRow === budgetLine.id && (
                    <div>
                      {budgetLine.budgetLineItems.map((item) => (
                        <div key={item.id}>
                          <p>Item ID: {item.id}</p>
                          <p>Item Name: {item.item.name}</p>
                          <p>Unit Cost: {item.item.unitCost}</p>
                          <p>Measuring Unit: {item.item.measuringUnit.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button onClick={() => toggleExpandRow(budgetLine.id)}>View Monthly Phasings</Button>
                  {expandedRow === budgetLine.id && (
                    <div>
                      {budgetLine.monthlyPhasings.map((monthlyPhasing) => (
                        <div key={monthlyPhasing.id}>
                          <p>Month: {monthlyPhasing.month}</p>
                          <p>Allocated Month Budget: {monthlyPhasing.allocatedMonthBudget}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
  }

  export default BudgetLineAdmin