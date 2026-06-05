import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi, SERVER_URL } from '../../api/api';
import type { Product, Category } from '../../types';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { getErrorMessage } from '../../utils/error';
import FormRow from './FormRow';
import AdminDataTable, { type DataTableColumn } from '../AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface VariantForm { id?: string; sku: string; barcode: string; price: string; size: string; temperature: string; memberDiscountRate: string; }
const emptyVariant = (): VariantForm => ({ sku: '', barcode: '', price: '', size: '', temperature: '', memberDiscountRate: '' });

const SIZE_LABELS: Record<string, string> = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};

const TEMP_LABELS: Record<string, string> = {
  HOT: 'Hot',
  ICED: 'Iced',
};

const NONE_VALUE = 'none';

const ProductsTab: React.FC = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(r => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.description) fd.append('description', form.description);
      if (form.categoryId) fd.append('categoryId', form.categoryId);
      if (imageFile) fd.append('image', imageFile);
      fd.append('variants', JSON.stringify(variants.map(v => ({
        ...(v.id ? { id: v.id } : {}),
        sku: v.sku,
        barcode: v.barcode || null,
        price: Number(v.price),
        size: v.size || null,
        temperature: v.temperature || null,
        memberDiscountRate: v.memberDiscountRate ? Number(v.memberDiscountRate) : null,
      }))));
      return editing ? productsApi.update(editing.id, fd) : productsApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setIsOpen(false);
      resetForm();
    },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menyimpan produk')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menghapus')),
  });

  const resetForm = () => { setForm({ name: '', description: '', categoryId: '' }); setVariants([emptyVariant()]); setImageFile(null); setImagePreview(''); setEditing(null); };

  const openAdd = () => { resetForm(); setIsOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', categoryId: p.categoryId || '' });
    setVariants(p.variants.map(v => ({ id: v.id, sku: v.sku, barcode: v.barcode || '', price: String(v.price), size: v.size || '', temperature: v.temperature || '', memberDiscountRate: String(v.memberDiscountRate ?? '') })));
    setImagePreview(p.image.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`);
    setImageFile(null);
    setIsOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const updateVariant = (i: number, field: keyof VariantForm, value: string) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const getImageUrl = (path: string) => path.startsWith('http') ? path : `${SERVER_URL}${path}`;
  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
  const getVariantLabel = (size?: string | null, temperature?: string | null, fallback?: string) => {
    const details = [
      size ? SIZE_LABELS[size] : null,
      temperature ? TEMP_LABELS[temperature] : null,
    ].filter(Boolean);

    return details.length > 0 ? details.join(' / ') : fallback || '-';
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'image',
      header: 'Gambar',
      render: p => (
        <img
          src={getImageUrl(p.image)}
          alt={p.name}
          className="h-11 w-14 rounded-md border object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/54x42?text=?'; }}
        />
      ),
      width: '80px',
    },
    {
      key: 'name',
      header: 'Nama',
      render: p => <strong>{p.name}</strong>,
      searchValue: p => `${p.name} ${p.description || ''}`,
      sortValue: p => p.name,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: p => p.category?.name ? <Badge variant="secondary">{p.category.name}</Badge> : <span className="text-muted-foreground">-</span>,
      searchValue: p => p.category?.name || '',
      sortValue: p => p.category?.name || '',
    },
    {
      key: 'variants',
      header: 'Varian',
      render: p => (
        <div className="space-y-1.5">
          {p.variants.map(v => (
            <div key={v.id} className="grid grid-cols-[minmax(120px,1fr)_auto_auto] items-center gap-2 text-xs">
              <span className="min-w-0">
                <strong className="text-foreground">{getVariantLabel(v.size, v.temperature, v.sku)}</strong>
                <span className="ml-1 font-mono text-muted-foreground">{v.sku}</span>
              </span>
              <span className="font-bold text-primary">{fmt(Number(v.price))}</span>
              <span className={v.currentStock <= 0 ? 'font-bold text-destructive' : v.currentStock <= 5 ? 'font-bold text-amber-600' : 'font-bold text-emerald-600'}>
                Stok {v.currentStock}
              </span>
            </div>
          ))}
        </div>
      ),
      searchValue: p => p.variants.map(v => `${v.sku} ${v.size || ''} ${v.temperature || ''}`).join(' '),
      sortValue: p => p.variants.length,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: p => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(p.id)}>Hapus</Button>
        </div>
      ),
      align: 'right',
      width: '150px',
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Manajemen Produk"
        data={products}
        columns={columns}
        getRowKey={p => p.id}
        isLoading={isLoading}
        searchPlaceholder="Cari produk, kategori, SKU..."
        actions={<Button size="sm" onClick={openAdd}>+ Tambah Produk</Button>}
      />

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} title={editing ? 'Edit Produk' : 'Tambah Produk'} size="lg">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <FormRow label="Nama Produk *">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormRow>
            <FormRow label="Deskripsi">
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </FormRow>
            <FormRow label="Kategori">
              <Select value={form.categoryId || NONE_VALUE} onValueChange={value => setForm(f => ({ ...f, categoryId: value === NONE_VALUE ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Tanpa Kategori</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label={editing ? 'Ganti Gambar (opsional)' : 'Gambar Produk *'}>
              <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-secondary-foreground" />
            </FormRow>
            {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-36 w-full rounded-md border object-cover" />}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground">Varian Produk *</label>
              <Button type="button" size="sm" onClick={addVariant}>+ Varian</Button>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {variants.map((v, i) => (
                <div key={i} className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">Varian #{i + 1}</span>
                    {variants.length > 1 && <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => removeVariant(i)}>Hapus</Button>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">SKU *</label><Input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Harga *</label><Input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Barcode</label><Input value={v.barcode} onChange={e => updateVariant(i, 'barcode', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Diskon Member (%)</label><Input type="number" value={v.memberDiscountRate} onChange={e => updateVariant(i, 'memberDiscountRate', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Ukuran</label>
                      <Select value={v.size || NONE_VALUE} onValueChange={value => updateVariant(i, 'size', value === NONE_VALUE ? '' : value)}>
                        <SelectTrigger><SelectValue placeholder="Pilih ukuran" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Tanpa ukuran</SelectItem>
                          <SelectItem value="SMALL">Small</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LARGE">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Suhu</label>
                      <Select value={v.temperature || NONE_VALUE} onValueChange={value => updateVariant(i, 'temperature', value === NONE_VALUE ? '' : value)}>
                        <SelectTrigger><SelectValue placeholder="Pilih suhu" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Tanpa suhu</SelectItem>
                          <SelectItem value="HOT">Hot</SelectItem>
                          <SelectItem value="ICED">Iced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Batal</Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!form.name || (!editing && !imageFile) || variants.some(v => !v.sku || !v.price) || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} message="Yakin hapus produk ini? Semua varian akan ikut terhapus." confirmDanger />
    </div>
  );
};

export default ProductsTab;
