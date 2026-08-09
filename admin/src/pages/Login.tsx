import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authService from "@/services/admin/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsError(false);
      await authService.login(email, password);
      navigate("/");
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col p-6 md:p-10">
        <div className="mb-auto flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            GC
          </div>
          <span className="text-lg font-semibold tracking-tight">GoCourier Admin</span>
        </div>

        <Card className="mx-auto w-full max-w-md border-border/80">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in with your admin credentials to manage GoCourier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gocourier.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
              {isError && (
                <p className="text-xs text-destructive">
                  Invalid credentials or not an admin account.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-auto pt-8 text-sm text-muted-foreground">
          Copyright © {new Date().getFullYear()} GoCourier
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden border-l border-border bg-sidebar lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.08),transparent_40%),radial-gradient(circle_at_70%_80%,oklch(1_0_0/0.05),transparent_45%)]" />
        <div className="relative z-10 max-w-sm px-8 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-border bg-card text-3xl font-bold">
            GC
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">GoCourier Admin</h2>
          <p className="text-sm text-muted-foreground">
            Control campuses, catalogs, orders, and revenue from one premium dark console.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
