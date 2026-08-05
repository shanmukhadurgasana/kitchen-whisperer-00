import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import {
  useChangePassword,
  useDeleteAccountData,
  useProfile,
  useUpdateProfile,
} from "@/services/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile(user?.id ?? "");
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccountData(user?.id ?? "");

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [password, setPassword] = useState("");

  return (
    <AppShell title="Profile" description="Manage your account details.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Name</Label>
              <Input
                id="full_name"
                maxLength={80}
                value={fullName}
                placeholder={profile?.full_name ?? "Your name"}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <Button
              onClick={() =>
                updateProfile.mutate({
                  full_name: fullName.trim(),
                  avatar_url: profile?.avatar_url ?? null,
                })
              }
              disabled={updateProfile.isPending}
            >
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button
              variant="secondary"
              disabled={changePassword.isPending}
              onClick={() => {
                if (password.length < 8) {
                  toast.error("Use at least 8 characters");
                  return;
                }
                changePassword.mutate(password, { onSuccess: () => setPassword("") });
              }}
            >
              Update password
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Delete my data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This permanently removes your recipes, plans, lists and profile, then signs you out.
            </p>
            <Button
              variant="destructive"
              disabled={deleteAccount.isPending}
              onClick={() =>
                deleteAccount.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Your data has been deleted");
                    navigate({ to: "/", replace: true });
                  },
                })
              }
            >
              Delete everything
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
