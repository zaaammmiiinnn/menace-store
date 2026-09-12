'use client';

import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Download,
} from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onExportCsv?: () => void;
  exportFileName?: string;
  bulkActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  emptyMessage = "No records found. Fix that.",
  isLoading = false,
  onExportCsv,
  exportFileName = 'export.csv',
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const exportToCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }

    if (data.length === 0) return;
    const headers = Object.keys(data[0] as object).join(',');
    const rows = data.map((row) =>
      Object.values(row as object)
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#121212] border border-[#222] rounded-md pl-9 pr-3 py-1.5 text-[13px] text-[#F5F1E8] placeholder-[#555] focus:outline-none focus:border-[#C6FF00]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {bulkActions && (
            <div className="flex items-center gap-2">
              {bulkActions}
            </div>
          )}
          <button
            onClick={exportToCsv}
            className="flex items-center gap-2 h-9 px-3 bg-[#171717] hover:bg-[#202020] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2A2A2A] rounded-md text-[12px] font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-[#1F1F1F] bg-[#0F0F0F] overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          {/* Table Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#1F1F1F] bg-[#141414]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-4 text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] font-semibold select-none"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-1.5 cursor-pointer hover:text-[#F5F1E8]'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="w-3 h-3 text-[#555]" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#181818]">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="h-11">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-4">
                      <div className="h-4 bg-[#1C1C1C] rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="h-11 hover:bg-[#151515] transition-colors text-[#F5F1E8]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 tabular-nums">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-[#8A8A8A] text-[13px] font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 text-[12px] font-mono text-[#8A8A8A]">
        <div>
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#141414] border border-[#222] rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1E1E1E] text-[#F5F1E8] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="text-[11px] text-[#666]">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#141414] border border-[#222] rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1E1E1E] text-[#F5F1E8] transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
