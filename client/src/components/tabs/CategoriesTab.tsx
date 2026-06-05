import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/api';
import type { Category } from '../../types';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { getErrorMessage } from '../../utils/error';
import FormRow from './FormRow';
import AdminDataTable, { type DataTableColumn } from '../AdminDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CategoriesTab: React.FC = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', memberDiscountRate: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { name: form.name, memberDiscountRate: form.memberDiscountRate ? Number(form.memberDiscountRate) : null };
      return editing ? categoriesApi.update(editing.id, data) : categoriesApi.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setIsOpen(false); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menyimpan')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menghapus')),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', memberDiscountRate: '' }); setIsOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, memberDiscountRate: String(c.memberDiscountRate ?? '') }); setIsOpen(true); };

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: c => c.name,
      searchValue: c => c.name,
      sortValue: c => c.name,
    },
    {
      key: 'discount',
      header: 'Diskon Member',
      render: c => c.memberDiscountRate != null ? `${c.memberDiscountRate}%` : '-',
      sortValue: c => Number(c.memberDiscountRate ?? 0),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: c => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(c.id)}>Hapus</Button>
        </div>
      ),
      align: 'right',
      width: '150px',
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Kategori Produk"
        data={categories}
        columns={columns}
        getRowKey={c => c.id}
        isLoading={isLoading}
        searchPlaceholder="Cari kategori..."
        actions={<Button size="sm" onClick={openAdd}>+ Tambah Kategori</Button>}
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
        <FormRow label="Nama Kategori">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormRow>
        <FormRow label="Diskon Member (%)">
          <Input type="number" min="0" max="100" value={form.memberDiscountRate} onChange={e => setForm(f => ({ ...f, memberDiscountRate: e.target.value }))} placeholder="Kosongkan jika tidak ada" />
        </FormRow>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} message="Yakin hapus kategori ini?" confirmDanger />
    </div>
  );
};

export default CategoriesTab;
