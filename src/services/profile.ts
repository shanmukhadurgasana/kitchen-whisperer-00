import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { full_name: string; avatar_url: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...values }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password changed"),
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Deletes all of the signed-in person's data, then signs them out. */
export function useDeleteAccountData(userId: string) {
  return useMutation({
    mutationFn: async () => {
      await supabase.from("shopping_items").delete().eq("user_id", userId);
      await supabase.from("shopping_lists").delete().eq("user_id", userId);
      await supabase.from("meal_plans").delete().eq("user_id", userId);
      await supabase.from("favorites").delete().eq("user_id", userId);
      await supabase.from("ingredients").delete().eq("user_id", userId);
      await supabase.from("recipes").delete().eq("user_id", userId);
      await supabase.from("categories").delete().eq("user_id", userId);
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
      await supabase.auth.signOut();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
