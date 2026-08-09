import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import userService from "@/services/admin/user.service";
import type { AdminUser } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Users = () => {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const load = async () => {
    const res = await userService.list({
      search: search || undefined,
      role: role !== "all" ? role : undefined,
    });
    setItems(res.data.data.items);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load().catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search, role]);

  const toggleActive = async (u: AdminUser) => {
    try {
      await userService.update(u.id, { is_active: !u.is_active });
      toast.success(u.is_active ? "User deactivated" : "User activated");
      await load();
    } catch {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Students and staff accounts" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          className="max-w-sm"
          placeholder="Search name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="ops">Ops</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="delivery_agent">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-30" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{u.email || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.phone || ""}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "secondary" : "destructive"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => void toggleActive(u)}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
