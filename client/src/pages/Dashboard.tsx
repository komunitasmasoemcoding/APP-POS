import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  BarChart3,
  Boxes,
  CreditCard,
  KeyRound,
  LayoutList,
  LogOut,
  Package,
  Tags,
  Users,
} from 'lucide-react';
import { analyticsApi } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import type { AnalyticsSummary, SalesGraphPoint, TopProduct } from '../types';
import ProductsTab from '../components/tabs/ProductsTab';
import CategoriesTab from '../components/tabs/CategoriesTab';
import MembersTab from '../components/tabs/MembersTab';
import OrdersTab from '../components/tabs/OrdersTab';
import StockTab from '../components/tabs/StockTab';
import UsersTab from '../components/tabs/UsersTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type TabKey = 'overview' | 'products' | 'categories' | 'members' | 'orders' | 'stock' | 'users';

const TABS: { key: TabKey; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'products', label: 'Produk', icon: Package },
  { key: 'categories', label: 'Kategori', icon: Tags },
  { key: 'members', label: 'Member', icon: Users },
  { key: 'orders', label: 'Order', icon: LayoutList },
  { key: 'stock', label: 'Stok', icon: Boxes },
  { key: 'users', label: 'User', icon: KeyRound, adminOnly: true },
];

const salesChartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: 'var(--chart-1)',
  },
  orders: {
    label: 'Order',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const OverviewTab: React.FC = () => {
  const { data: summary, isLoading: sumLoading, error: sumError } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary().then(r => r.data),
  });

  const { data: topProducts = [], isLoading: topLoading } = useQuery<TopProduct[]>({
    queryKey: ['analytics-top-products'],
    queryFn: () => analyticsApi.getTopProducts().then(r => r.data),
  });

  const { data: salesGraph = [], isLoading: graphLoading } = useQuery<SalesGraphPoint[]>({
    queryKey: ['analytics-sales-graph'],
    queryFn: () => analyticsApi.getSalesGraph().then(r => r.data),
  });

  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
  const compactCurrency = (n: number) => {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
    if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
    return `Rp ${n}`;
  };
  const chartData = salesGraph.map(item => ({
    ...item,
    label: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
  }));

  if (sumError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center text-sm text-red-700">
          Tidak bisa memuat analytics. Pastikan Anda memiliki permission <code>view_reports</code>.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Ringkasan Hari Ini</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pantau performa penjualan dan produk terlaris.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Pendapatan Hari Ini"
          value={sumLoading ? '...' : fmt(summary?.today?.revenue ?? 0)}
          sub={sumLoading ? '' : `Kemarin: ${fmt(summary?.yesterday?.revenue ?? 0)}`}
          positive={(summary?.today?.revenue ?? 0) >= (summary?.yesterday?.revenue ?? 0)}
          icon={CreditCard}
        />
        <StatCard
          label="Order Hari Ini"
          value={sumLoading ? '...' : String(summary?.today?.orders ?? 0)}
          sub={sumLoading ? '' : `Kemarin: ${summary?.yesterday?.orders ?? 0} order`}
          positive={(summary?.today?.orders ?? 0) >= (summary?.yesterday?.orders ?? 0)}
          icon={LayoutList}
        />
        <StatCard
          label="Rata-rata per Order"
          value={sumLoading ? '...' : (
            (summary?.today?.orders ?? 0) > 0
              ? fmt((summary?.today?.revenue ?? 0) / (summary?.today?.orders ?? 1))
              : 'Rp 0'
          )}
          sub="Hari ini"
          icon={BarChart3}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Penjualan 7 Hari</CardTitle>
          <CardDescription>Pendapatan harian dan jumlah order aktif.</CardDescription>
        </CardHeader>
        <CardContent>
          {graphLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading chart...</p>
          ) : (
            <ChartContainer config={salesChartConfig} className="h-72 w-full">
              <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={compactCurrency}
                  width={72}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                      formatter={(value, name) => (
                        <div className="flex min-w-40 items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {name === 'revenue' ? 'Pendapatan' : 'Order'}
                          </span>
                          <span className="font-mono font-medium text-foreground">
                            {name === 'revenue' ? fmt(Number(value)) : `${Number(value).toLocaleString('id-ID')} order`}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  yAxisId="revenue"
                  dataKey="revenue"
                  type="monotone"
                  fill="var(--color-revenue)"
                  fillOpacity={0.18}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="orders"
                  dataKey="orders"
                  type="monotone"
                  fill="var(--color-orders)"
                  fillOpacity={0.08}
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 Produk Terlaris</CardTitle>
          <CardDescription>Diurutkan berdasarkan jumlah produk terjual.</CardDescription>
        </CardHeader>
        <CardContent>
          {topLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data penjualan</p>
          ) : (
            <div className="border-y">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead>#</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead className="text-right">Total Pendapatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground">{item.productName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                      <TableCell><strong>{item.totalSold}</strong> pcs</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{fmt(item.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, positive }) => (
  <Card>
    <CardContent className="flex items-start justify-between p-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        <p className={cn('mt-1 text-xs', positive === undefined ? 'text-muted-foreground' : positive ? 'text-green-600' : 'text-red-600')}>{sub}</p>
      </div>
      <div className="rounded-md bg-primary/10 p-2 text-primary">
        <Icon className="size-5" />
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { user, logout, isAdmin } = useAuth();

  const visibleTabs = TABS.filter(t => !t.adminOnly || isAdmin());

  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="text-sm font-bold text-sidebar-foreground">Cafe POS</div>
          <div className="mt-1 text-xs text-sidebar-foreground/70">Dashboard Admin</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="p-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleTabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <SidebarMenuItem key={tab.key}>
                      <SidebarMenuButton
                        type="button"
                        isActive={active}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          'rounded-none',
                          active && '!bg-black !text-white hover:!bg-black hover:!text-white',
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{tab.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator className="mx-0" />
        <SidebarFooter className="p-3">
          <div className="border bg-muted px-3 py-2">
            <div className="text-xs text-muted-foreground">Login sebagai</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">{user?.username}</span>
              {user?.role && <Badge variant="secondary" className="rounded-none">{user.role}</Badge>}
            </div>
          </div>
          <div className="grid gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={() => window.location.href = '/'}>
              Ke POS
            </Button>
            <Button type="button" variant="destructive" size="sm" className="rounded-none" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-screen overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'users' && <UsersTab />}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
