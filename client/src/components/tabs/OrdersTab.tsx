import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/api';
import type { Order, OrderStatus } from '../../types';
import { getErrorMessage } from '../../utils/error';
import ReceiptModal from '../ReceiptModal';
import AdminDataTable, { type DataTableColumn } from '../AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700',
};

const OrdersTab: React.FC = () => {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal update status')),
  });

  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
  const fmtDate = (s: string) => new Date(s).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'orderNumber',
      header: 'No. Order',
      render: o => <strong className="font-mono text-xs">{o.orderNumber}</strong>,
      searchValue: o => o.orderNumber,
      sortValue: o => o.orderNumber,
    },
    {
      key: 'createdAt',
      header: 'Waktu',
      render: o => <span className="text-xs text-muted-foreground">{fmtDate(o.createdAt)}</span>,
      sortValue: o => new Date(o.createdAt),
    },
    {
      key: 'cashier',
      header: 'Kasir',
      render: o => o.cashier?.username || '-',
      searchValue: o => o.cashier?.username || '',
      sortValue: o => o.cashier?.username || '',
    },
    {
      key: 'member',
      header: 'Member',
      render: o => o.member?.name || <span className="text-muted-foreground">-</span>,
      searchValue: o => o.member?.name || '',
      sortValue: o => o.member?.name || '',
    },
    {
      key: 'total',
      header: 'Total',
      render: o => <strong>{fmt(o.totalAmount)}</strong>,
      sortValue: o => Number(o.totalAmount),
      align: 'right',
    },
    {
      key: 'payment',
      header: 'Pembayaran',
      render: o => <Badge variant="secondary">{o.paymentMethod}</Badge>,
      searchValue: o => o.paymentMethod || '',
      sortValue: o => o.paymentMethod || '',
    },
    {
      key: 'status',
      header: 'Status',
      render: o => (
        <Badge variant="outline" className={STATUS_CLASSES[o.status]}>
          {o.status}
        </Badge>
      ),
      searchValue: o => o.status,
      sortValue: o => o.status,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: o => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setReceiptOrder(o); }}>Struk</Button>
          {o.status === 'PREPARING' && (
            <>
              <Button size="sm" onClick={e => { e.stopPropagation(); updateStatusMutation.mutate({ id: o.id, status: 'COMPLETED' }); }}>Selesai</Button>
              <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); updateStatusMutation.mutate({ id: o.id, status: 'CANCELLED' }); }}>Batal</Button>
            </>
          )}
        </div>
      ),
      align: 'right',
      width: '220px',
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Riwayat Order"
        data={orders}
        columns={columns}
        getRowKey={o => o.id}
        isLoading={isLoading}
        searchPlaceholder="Cari no order, kasir, member..."
        onRowClick={o => setExpandedId(expandedId === o.id ? null : o.id)}
        isRowExpanded={o => expandedId === o.id}
        renderExpandedRow={o => (
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Produk</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {o.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.variant?.product?.name || '-'}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{item.variant?.sku || '-'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{fmt(item.unitPrice)}</TableCell>
                  <TableCell>{item.discountApplied > 0 ? `-${fmt(item.discountApplied)}` : '-'}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      />
      <ReceiptModal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} title="Struk Order" />
    </div>
  );
};

export default OrdersTab;
