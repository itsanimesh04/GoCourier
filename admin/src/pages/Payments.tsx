import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import paymentService from "@/services/admin/payment.service";
import type { PaymentRow } from "@/types/admin.types";
import { formatStatus, paymentStatusVariant } from "@/lib/status";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Payments = () => {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    paymentService
      .list(status !== "all" ? { status } : undefined)
      .then((res) => setItems(res.data.data.items))
      .catch(() => setItems([]));
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="Gateway payments linked to orders" />

      <div className="max-w-xs">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="created">created</SelectItem>
            <SelectItem value="paid">paid</SelectItem>
            <SelectItem value="failed">failed</SelectItem>
            <SelectItem value="refunded">refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="hidden sm:table-cell">Gateway</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.slice(-8)}</TableCell>
                      <TableCell className="font-mono text-xs">{p.order_id.slice(-8)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{p.gateway}</TableCell>
                      <TableCell>₹{p.amount}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant(p.status)} className="capitalize">
                          {formatStatus(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {new Date(p.created_at).toLocaleString()}
                      </TableCell>
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

export default Payments;
