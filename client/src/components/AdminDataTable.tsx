import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  searchValue?: (row: T) => string;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  actions?: React.ReactNode;
  emptyText?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isRowExpanded?: (row: T) => boolean;
}

const pageSizes = [10, 25, 50];

const normalizeSortValue = (value: string | number | Date | null | undefined) => {
  if (value instanceof Date) return value.getTime();
  if (value == null) return '';
  return value;
};

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function AdminDataTable<T>({
  title,
  data,
  columns,
  getRowKey,
  isLoading = false,
  actions,
  emptyText = 'Tidak ada data',
  searchPlaceholder = 'Cari data...',
  onRowClick,
  renderExpandedRow,
  isRowExpanded,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const searchableColumns = columns.filter(column => column.searchValue);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter(row => {
      const values = searchableColumns.length > 0 ? searchableColumns : columns;
      return values.some(column => {
        const value = column.searchValue?.(row) ?? String(column.render(row) ?? '');
        return value.toLowerCase().includes(query);
      });
    });
  }, [columns, data, search, searchableColumns]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const column = columns.find(item => item.key === sort.key);
    if (!column?.sortValue) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = normalizeSortValue(column.sortValue?.(a));
      const bValue = normalizeSortValue(column.sortValue?.(b));

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sort.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [columns, filteredData, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleData = sortedData.slice(startIndex, startIndex + pageSize);

  const changeSort = (key: string) => {
    const column = columns.find(item => item.key === key);
    if (!column?.sortValue) return;
    setPage(1);
    setSort(current => {
      if (current?.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filteredData.length} dari {data.length} data
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>
          {actions}
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {columns.map(column => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap',
                    alignClass[column.align || 'left'],
                  )}
                  style={{ width: column.width }}
                >
                  <button
                    type="button"
                    onClick={() => changeSort(column.key)}
                    disabled={!column.sortValue}
                    className={cn(
                      'inline-flex items-center gap-1 bg-transparent p-0 text-inherit',
                      column.sortValue ? 'cursor-pointer hover:text-foreground' : 'cursor-default',
                    )}
                  >
                    {column.header}
                    {column.sortValue && <ChevronsUpDown className="size-3" />}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : visibleData.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">{emptyText}</TableCell></TableRow>
            ) : visibleData.map(row => (
              <React.Fragment key={getRowKey(row)}>
                <TableRow
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map(column => (
                    <TableCell
                      key={column.key}
                      className={cn(alignClass[column.align || 'left'])}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
                {isRowExpanded?.(row) && renderExpandedRow && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="bg-muted/30 pb-3">
                      {renderExpandedRow(row)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Baris</span>
          <Select value={String(pageSize)} onValueChange={value => { setPageSize(Number(value)); setPage(1); }}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
            </SelectContent>
          </Select>
          <span>
            {sortedData.length === 0 ? '0' : startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} dari {sortedData.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={safePage <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-20 text-center text-xs text-muted-foreground">Hal {safePage} / {totalPages}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safePage >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AdminDataTable;
