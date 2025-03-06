import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableCaption, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardTitle } from "../ui/card"

export const columns = [
    {
      accessorKey: "lineNumber",
      header: "Line Number",
    },
    {
      accessorKey: "data.EstateCode",
      header: "Estate Code",
    },
    {
      accessorKey: "data.ItemName",
      header: "Item Name",
    },
    {
      accessorKey: "data.BudgetYear",
      header: "Financial Year",
    },
    {
      accessorKey: "data.QuantityBudgeted",
      header: "Quantity Budgeted",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
  ]

export function SkippedBudgetLines({ skippedBudgetLines }) {
  const table = useReactTable({
    data: skippedBudgetLines || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  return (
    <div className="w-full mt-4">
        <CardTitle className='mt-4 mb-2 ml-2'>
            Rejected Budget Lines 
            {skippedBudgetLines?.length > 0 && ` (${skippedBudgetLines.length})`}
        </CardTitle>
      <Card> 
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No skipped budget lines.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}