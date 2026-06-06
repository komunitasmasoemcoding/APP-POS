import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Order } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  title?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order, title = '✓ Order Berhasil!' }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt ${order.orderNumber}</title>
      <style>body{font-family:monospace;padding:20px;max-width:300px;margin:0 auto;}
      h2,p{margin:4px 0;}hr{border:1px dashed #000;}
      table{width:100%;}td{vertical-align:top;padding:2px 0;}
      .right{text-align:right;}.bold{font-weight:bold;}</style>
      </head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
  const formatDate = (s: string) => new Date(s).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-green-600">{title}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-6">
          <div id="receipt-content" className="font-mono text-[0.85rem] leading-relaxed">
            <div className="mb-3 text-center">
              <strong className="text-base">CAFE POS SYSTEM</strong>
              <br />
              <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
            </div>
            <hr className="my-2 border-dashed" />
            <div><strong>No:</strong> {order.orderNumber}</div>
            <div><strong>Kasir:</strong> {order.cashier?.username || '-'}</div>
            {order.member && <div><strong>Member:</strong> {order.member.name}</div>}
            <div><strong>Pembayaran:</strong> {order.paymentMethod}</div>
            <hr className="my-2 border-dashed" />
            <table className="w-full border-collapse">
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      {item.variant?.product?.name || '-'}<br />
                      <span className="text-xs text-muted-foreground">{item.variant?.sku}</span>
                    </td>
                    <td className="text-right align-top">
                      {item.quantity}x<br />
                      <span className="text-xs">{formatCurrency(item.unitPrice)}</span>
                    </td>
                    <td className="text-right align-top">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span><span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between text-base font-bold">
              <span>TOTAL</span><span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <hr className="my-2 border-dashed" />
            <p className="mt-2 text-center text-xs text-muted-foreground">Terima kasih!</p>
          </div>

          <div className="mt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="size-4" />
              Print
            </Button>
            <Button type="button" className="flex-1" onClick={onClose}>
              Selesai
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptModal;
