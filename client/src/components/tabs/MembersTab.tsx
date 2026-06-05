import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../../api/api';
import type { Member } from '../../types';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { getErrorMessage } from '../../utils/error';
import FormRow from './FormRow';
import AdminDataTable, { type DataTableColumn } from '../AdminDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MembersTab: React.FC = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', barcode: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => membersApi.getAll().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { name: form.name, phone: form.phone || undefined, email: form.email || undefined, barcode: form.barcode || undefined };
      return editing ? membersApi.update(editing.id, data) : membersApi.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setIsOpen(false); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menyimpan')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setDeleteTarget(null); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menghapus')),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', email: '', barcode: '' }); setIsOpen(true); };
  const openEdit = (m: Member) => { setEditing(m); setForm({ name: m.name, phone: m.phone || '', email: m.email || '', barcode: m.barcode || '' }); setIsOpen(true); };

  const columns: DataTableColumn<Member>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: m => <strong>{m.name}</strong>,
      searchValue: m => m.name,
      sortValue: m => m.name,
    },
    {
      key: 'phone',
      header: 'Telepon',
      render: m => m.phone || '-',
      searchValue: m => m.phone || '',
      sortValue: m => m.phone || '',
    },
    {
      key: 'email',
      header: 'Email',
      render: m => m.email || '-',
      searchValue: m => m.email || '',
      sortValue: m => m.email || '',
    },
    {
      key: 'barcode',
      header: 'Barcode',
      render: m => <code className="rounded bg-muted px-2 py-1 text-xs">{m.barcode || '-'}</code>,
      searchValue: m => m.barcode || '',
      sortValue: m => m.barcode || '',
    },
    {
      key: 'createdAt',
      header: 'Bergabung',
      render: m => new Date(m.createdAt).toLocaleDateString('id-ID'),
      sortValue: m => new Date(m.createdAt),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: m => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(m)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(m.id)}>Hapus</Button>
        </div>
      ),
      align: 'right',
      width: '150px',
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Manajemen Member"
        data={members}
        columns={columns}
        getRowKey={m => m.id}
        isLoading={isLoading}
        searchPlaceholder="Cari member..."
        actions={<Button size="sm" onClick={openAdd}>+ Tambah Member</Button>}
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Member' : 'Tambah Member'}>
        <FormRow label="Nama *"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormRow>
        <FormRow label="Telepon"><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></FormRow>
        <FormRow label="Email"><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormRow>
        <FormRow label="Barcode"><Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} /></FormRow>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} message="Yakin hapus member ini?" confirmDanger />
    </div>
  );
};

export default MembersTab;
