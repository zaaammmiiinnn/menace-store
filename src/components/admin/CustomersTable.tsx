'use client';

import React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/DataTable';
import { ExternalLink } from 'lucide-react';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  firstOrder: number;
  lastOrder: number;
}

interface CustomersTableProps {
  customers: CustomerRow[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <Link
            href={`/admin/customers/${row.original.id}`}
            prefetch={false}
            className="font-medium text-[#F5F1E8] hover:text-[#C6FF00] transition-colors"
          >
            {row.original.name}
          </Link>
          <div className="text-[11px] font-mono text-[#666]">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'ordersCount',
      header: 'Orders',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-[#F5F1E8]">
          {row.getValue('ordersCount')} order(s)
        </span>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#C6FF00] tabular-nums">
          ₹{Number(row.getValue('totalSpent')).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'lastOrder',
      header: 'Last Active',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#8A8A8A]">
          {new Date(row.original.lastOrder).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link
          href={`/admin/customers/${row.original.id}`}
          prefetch={false}
          className="p-1 text-[#666] hover:text-[#F5F1E8] transition-colors inline-block"
          title="View profile"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchPlaceholder="Search customers by name, email..."
      emptyMessage="No customers on file."
      exportFileName="menance-customers.csv"
    />
  );
}
