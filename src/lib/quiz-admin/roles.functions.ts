import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OWNER_EMAIL = "matheus@anagrow.com.br";

/**
 * Confirma no servidor se a pessoa autenticada é super admin.
 * O proprietário definido recebe o papel na primeira entrada.
 */
export const claimSuperAdminFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const email = String((context.claims as { email?: string }).email ?? "").toLowerCase();

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      if (email === OWNER_EMAIL) {
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "super_admin" }, { onConflict: "user_id,role" });
        return { isSuperAdmin: true };
      }

      const { data } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();
      return { isSuperAdmin: Boolean(data) };
    } catch (error) {
      console.error("claimSuperAdminFn failed", error);
      return { isSuperAdmin: false };
    }
  });
