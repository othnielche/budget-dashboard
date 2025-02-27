import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableCaption,TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardTitle } from "../ui/card"

// export const columns = [
//   {
//     accessorKey: "row",
//     header: "Row Data",
//     cell: ({ row }) => (
//       <div>
//         <pre>{JSON.stringify(row.getValue("row"), null, 2)}</pre>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "reason",
//     header: "Reason",
//     cell: ({ row }) => <div>{row.getValue("reason")}</div>,
//   },
// ]

export const columns = [
    {
      accessorKey: "row.EstateCode",
      header: "Estate Code",
    },
    {
      accessorKey: "row.ItemName",
      header: "Item Name",
    },
    {
      accessorKey: "row.BudgetYear",
      header: "Financial Year",
    },
    {
      accessorKey: "row.QuantityBudgeted",
      header: "Quantity Budgeted",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
  ]

export function SkippedBudgetLines({ skippedBudgetLines }) {
  const table = useReactTable({
    data: skippedBudgetLines,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full mt-4">
        <CardTitle className='mt-4 mb-2 ml-2'>
            Rejected Budget Lines 
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