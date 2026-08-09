import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/PageHeader";
import revenueService from "@/services/admin/revenue.service";
import type { RevenueSummary } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const chartConfig = {
  gmv: { label: "GMV", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-3)" },
} satisfies ChartConfig;

const Revenue = () => {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    revenueService
      .summary()
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const dayData = useMemo(
    () =>
      (data?.by_day ?? []).map((d) => ({
        date: d.date.slice(5),
        gmv: Number(d.gmv) || 0,
        orders: d.order_count,
      })),
    [data]
  );

  const cards = [
    ["GMV", data?.gmv],
    ["Fees", data?.fees],
    ["Refunds", data?.refunds],
    ["Net", data?.net_revenue],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" subtitle="GMV, fees, refunds, and daily trends" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">₹{value ?? "0.00"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily GMV</CardTitle>
          <CardDescription>
            {data?.order_count ?? 0} orders · {data?.refund_count ?? 0} refunds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-70 w-full" />
          ) : dayData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No revenue data yet</p>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-70 w-full">
              <BarChart data={dayData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="gmv" fill="var(--color-gmv)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By campus</CardTitle>
          <CardDescription>GMV breakdown per campus</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campus</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.by_campus ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No campus revenue yet
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.by_campus.map((row) => (
                    <TableRow key={row.campus_id ?? "none"}>
                      <TableCell className="font-mono text-xs">
                        {row.campus_id?.slice(-8) ?? "—"}
                      </TableCell>
                      <TableCell>{row.order_count}</TableCell>
                      <TableCell className="text-right">₹{row.gmv}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
