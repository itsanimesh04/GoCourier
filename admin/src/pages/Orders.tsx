import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import orderService from "@/services/admin/order.service";
import type { OrderRow } from "@/types/admin.types";
import {
  ORDER_STATUSES,
  formatStatus,
  orderStatusVariant,
  paymentStatusVariant,
} from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetail {
  id: string;
  restaurant_name?: string | null;
  total_amount: string;
  drop_point?: string | null;
  payment_status: string;
  order_status: string;
  items?: {
    id: string;
    name: string;
    quantity: number;
    unit_price: string;
    item_status: string;
    item_kind?: string;
    note?: string | null;
  }[];
}

const Orders = () => {
  const [items, setItems] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowSavingId, setRowSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderService.list(
        statusFilter !== "all" ? { order_status: statusFilter } : undefined
      );
      setItems(res.data.data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const openDetail = async (id: string) => {
    try {
      const res = await orderService.getById(id);
      setDetail(res.data.data);
      setNewStatus(res.data.data.order_status);
    } catch {
      toast.error("Failed to load order detail");
    }
  };

  const updateStatus = async () => {
    if (!detail || !newStatus) return;
    setSaving(true);
    try {
      await orderService.updateStatus(detail.id, newStatus);
      toast.success(`Order updated to ${formatStatus(newStatus)}`);
      setDetail(null);
      await load();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setSaving(false);
    }
  };

  const quickUpdate = async (id: string, order_status: string) => {
    setRowSavingId(id);
    try {
      await orderService.updateStatus(id, order_status);
      toast.success(`Status set to ${formatStatus(order_status)}`);
      await load();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setRowSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Filter and update order status" />

      <div className="max-w-xs">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {formatStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead className="hidden md:table-cell">Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Quick update</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                      <TableCell>{o.restaurant_name ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {o.student?.name || o.student?.email || o.student?.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant(o.order_status)} className="capitalize">
                          {formatStatus(o.order_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={paymentStatusVariant(o.payment_status)} className="capitalize">
                          {formatStatus(o.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{o.total_amount}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Select
                          value={o.order_status}
                          onValueChange={(v) => void quickUpdate(o.id, v)}
                          disabled={rowSavingId === o.id}
                        >
                          <SelectTrigger className="h-8 w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">
                                {formatStatus(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => void openDetail(o.id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order detail</SheetTitle>
            <SheetDescription className="font-mono text-xs">
              {detail?.id}
            </SheetDescription>
          </SheetHeader>

          {detail && (
            <div className="space-y-5 px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Restaurant</p>
                  <p className="font-medium">{detail.restaurant_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">₹{detail.total_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Drop</p>
                  <p className="font-medium">{detail.drop_point || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <Badge variant={paymentStatusVariant(detail.payment_status)} className="capitalize">
                    {formatStatus(detail.payment_status)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Update status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {formatStatus(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail.items ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            {item.name}
                            {item.item_kind && item.item_kind !== "food" && (
                              <p className="text-xs text-muted-foreground capitalize">{item.item_kind.replace("_", " ")}</p>
                            )}
                            {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.unit_price}</TableCell>
                        <TableCell className="capitalize">{formatStatus(item.item_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <SheetFooter className="px-4 pb-4">
            <Button
              onClick={() => void updateStatus()}
              disabled={saving || !detail || newStatus === detail.order_status}
            >
              {saving ? "Saving…" : "Update status"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Orders;
