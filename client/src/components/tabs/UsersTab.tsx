import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/api';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { getErrorMessage } from '../../utils/error';
import FormRow from './FormRow';
import AdminDataTable, { type DataTableColumn } from '../AdminDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface UserRecord { id: string; username: string; role: { id: string; name: string }; }
interface Role { id: string; name: string; }

const UsersTab: React.FC = () => {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', roleId: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(r => r.data),
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ username: form.username, password: form.password, roleId: form.roleId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setIsOpen(false); setForm({ username: '', password: '', roleId: '' }); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal membuat user')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); },
    onError: (e: unknown) => alert(getErrorMessage(e, 'Gagal menghapus')),
  });

  const columns: DataTableColumn<UserRecord>[] = [
    {
      key: 'username',
      header: 'Username',
      render: u => <strong>{u.username}</strong>,
      searchValue: u => u.username,
      sortValue: u => u.username,
    },
    {
      key: 'role',
      header: 'Role',
      render: u => (
        <Badge variant={u.role?.name === 'ADMIN' ? 'default' : 'secondary'}>
          {u.role?.name || '-'}
        </Badge>
      ),
      searchValue: u => u.role?.name || '',
      sortValue: u => u.role?.name || '',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: u => <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(u.id)}>Hapus</Button>,
      align: 'right',
      width: '110px',
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Manajemen User"
        data={users}
        columns={columns}
        getRowKey={u => u.id}
        isLoading={isLoading}
        searchPlaceholder="Cari user..."
        actions={<Button size="sm" onClick={() => setIsOpen(true)}>+ Tambah User</Button>}
      />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tambah User" size="sm">
        <FormRow label="Username *"><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></FormRow>
        <FormRow label="Password *"><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></FormRow>
        <FormRow label="Role *">
          <Select value={form.roleId} onValueChange={value => setForm(f => ({ ...f, roleId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button type="button" onClick={() => createMutation.mutate()} disabled={!form.username || !form.password || !form.roleId || createMutation.isPending}>
            {createMutation.isPending ? 'Membuat...' : 'Buat User'}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} message="Yakin hapus user ini? Aksi ini tidak bisa dibatalkan." confirmDanger />
    </div>
  );
};

export default UsersTab;
