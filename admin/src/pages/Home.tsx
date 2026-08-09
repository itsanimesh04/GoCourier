import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  ShoppingBag,
  Users,
  Layers,
  MapPin,
  UtensilsCrossed,
  IndianRupee,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/PageHeader";
import dashboardService from "@/services/admin/dashboard.service";
import type { DashboardStats } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatStatus, orderStatusVariant, paymentStatusVariant } from "@/lib/status";

const trendConfig = {
  orders: { label: "Orders", color: "var(--chart-1)" },
  gmv: { label: "GMV", color: "var(--chart-2)" },
} satisfies ChartConfig;

const statusConfig = {
  count: { label: "Orders", color: "var(--chart-1)" },
} satisfies ChartConfig;

const STATUS_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.85 0 0)",
  "oklch(0.65 0 0)",
  "oklch(0.45 0 0)",
];

const Home = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const trendData = useMemo(
    () =>
      (stats?.orders_last_14_days ?? []).map((d) => ({
        date: d.date.slice(5),
        orders: d.order_count,
        gmv: Number(d.gmv) || 0,
      })),
    [stats]
  );

  const statusData = useMemo(
    () =>
      (stats?.orders_by_status ?? []).map((s) => ({
        status: formatStatus(s.status),
        count: s.count,
        key: s.status,
      })),
    [stats]
  );

  const cards = [
    { title: "Orders today", value: stats?.orders_today ?? 0, icon: ShoppingBag },
    { title: "GMV today", value: `₹${stats?.gmv_today ?? "0.00"}`, icon: IndianRupee },
    { title: "Active students", value: stats?.active_users ?? 0, icon: Users },
    { title: "Open batches", value: stats?.open_batches ?? 0, icon: Layers },
    { title: "Restaurants", value: stats?.active_restaurants ?? 0, icon: MapPin },
    { title: "Menu items", value: stats?.available_menu_items ?? 0, icon: UtensilsCrossed },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Live snapshot of GoCourier operations"
        actions={
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{card.title}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Orders & GMV</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="aspect-video w-full" />
            ) : trendData.every((d) => d.orders === 0 && d.gmv === 0) ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No order data yet</p>
            ) : (
              <ChartContainer config={trendConfig} className="aspect-auto h-65 w-full">
                <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={11} width={32} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    fill="var(--color-orders)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="gmv"
                    stroke="var(--color-gmv)"
                    fill="var(--color-gmv)"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>By status</CardTitle>
            <CardDescription>All-time order mix</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto size-48 rounded-full" />
            ) : statusData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No status data</p>
            ) : (
              <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-65">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={55} strokeWidth={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest activity across campuses</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (stats?.recent_orders ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No recent orders
                    </TableCell>
                  </TableRow>
                ) : (
                  stats?.recent_orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                      <TableCell>{o.restaurant_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant(o.order_status)} className="capitalize">
                          {formatStatus(o.order_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant(o.payment_status)} className="capitalize">
                          {formatStatus(o.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{o.total_amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!loading && trendData.some((d) => d.orders > 0) && (
        <Card className="xl:hidden">
          <CardHeader>
            <CardTitle>Daily orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="aspect-auto h-50 w-full">
              <BarChart data={trendData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
