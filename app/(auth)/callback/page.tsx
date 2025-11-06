"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../store/hooks";
import { setUser } from "../../../store/reducers/userSlice";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { onAuthenticatedUser } from "../../actions/auth";
import { Loader } from "lucide-react";


export default function AuthCallbackPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

        if (!session) {
          router.replace("/sign-in");
          return;
        }

        const result = await onAuthenticatedUser(session.access_token);

        if (!(result && result.status === 200 && result.user)) {
          router.replace("/");
          return;
        }

        // auth-provided identifiers
        const authIdRaw = result.user.id;
        const authIdStr = String(authIdRaw);
        const numericId = /^\d+$/.test(authIdStr) ? parseInt(authIdStr, 10) : null;
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const authIsUuid = uuidRegex.test(authIdStr);

        const email = result.user.email ?? null;
        const fullName = result.user.user_metadata?.full_name ?? null;
        const phone = result.user.phone ?? null;
        const role = "user";
        const status = "active";

        // build row to insert/update (leave unspecified fields out to keep them null)
        const userRowInsert = {
          // set numeric id only if auth id is numeric and you want to force id
          ...(numericId ? { id: numericId } : {}),
          // If auth id is UUID-like, store in user_id column
          ...(authIsUuid ? { user_id: authIdStr } : {}),
          // always keep a text copy in n8n_uuid for fallback lookups
          n8n_uuid: authIdStr,
          email,
          name: fullName,
          phone,
          role,
          status,
          chatbot_subscription_active: false,
          chatbot_trail_active: false,
          chatbot_user_blocked: false,
        };

        // ---------- 1) find existing user ----------
        let existingUser = null;

        // prefer lookup by user_id (uuid) if auth id is uuid
        if (authIsUuid) {
          const { data, error } = await supabaseBrowser
            .from("users")
            .select("id, user_id, n8n_uuid, email")
            .eq("user_id", authIdStr)
            .maybeSingle();
          if (error) console.error("select by user_id error:", error);
          existingUser = data || null;
        }

        // then try by numeric id
        if (!existingUser && numericId) {
          const { data, error } = await supabaseBrowser
            .from("users")
            .select("id, user_id, n8n_uuid, email")
            .eq("id", numericId)
            .maybeSingle();
          if (error) console.error("select by id error:", error);
          existingUser = data || null;
        }

        // then try by n8n_uuid (string copy)
        if (!existingUser) {
          const { data, error } = await supabaseBrowser
            .from("users")
            .select("id, user_id, n8n_uuid, email")
            .eq("n8n_uuid", authIdStr)
            .maybeSingle();
          if (error) console.error("select by n8n_uuid error:", error);
          existingUser = data || null;
        }

        // then fallback to email
        if (!existingUser && email) {
          const { data, error } = await supabaseBrowser
            .from("users")
            .select("id, user_id, n8n_uuid, email")
            .eq("email", email)
            .maybeSingle();
          if (error) console.error("select by email error:", error);
          existingUser = data || null;
        }

        // ---------- 2) insert or update ----------
        if (!existingUser) {
          const { error: insertError } = await supabaseBrowser
            .from("users")
            .insert([userRowInsert]);

          if (insertError) {
            console.error("Error inserting user:", insertError);
          } else {
            console.log("Inserted new user row");
          }
        } else {
          // compose match clause priority: user_id -> id -> n8n_uuid -> email
          let matchClause = null;
          if (authIsUuid) {
            matchClause = { user_id: authIdStr };
          } else if (numericId && existingUser.id === numericId) {
            matchClause = { id: numericId };
          } else if (existingUser.n8n_uuid) {
            matchClause = { n8n_uuid: existingUser.n8n_uuid };
          } else if (email) {
            matchClause = { email };
          }

          if (matchClause) {
            const { error: updateErr } = await supabaseBrowser
              .from("users")
              .update({
                // update only columns we want to overwrite
                name: fullName,
                email: email,
                phone: phone,
                role,
                status,
                // sync both auth uuid and text copy
                ...(authIsUuid ? { user_id: authIdStr } : {}),
                n8n_uuid: authIdStr,
                chatbot_subscription_active: false,
                chatbot_trail_active: false,
                chatbot_user_blocked: false,
              })
              .match(matchClause);

            if (updateErr) {
              console.error("Error updating user:", updateErr);
            } else {
              console.log("Updated existing user row");
            }
          } else {
            console.warn("No valid match clause found for update - skipping update.");
          }
        }

        // ---------- 3) fetch subscription data ----------
        // Try to fetch by user_id (uuid) first, then by numeric id, then fallback to email
        let subscriptionData = null;

        if (authIsUuid) {
          const { data, error } = await supabaseBrowser
            .from("user_subscription")
            .select("*")
            .eq("user_id", authIdStr);
          if (error) console.error("subscription select by user_id error:", error);
          subscriptionData = data ?? null;
        }

        if (!subscriptionData && numericId) {
          const { data, error } = await supabaseBrowser
            .from("user_subscription")
            .select("*")
            .eq("user_id", numericId);
          if (error) console.error("subscription select by numeric user_id error:", error);
          subscriptionData = data ?? null;
        }

        if (!subscriptionData && email) {
          const { data, error } = await supabaseBrowser
            .from("user_subscription")
            .select("*")
            .eq("email", email);
          if (error) console.error("subscription select by email error:", error);
          subscriptionData = data ?? null;
        }

        // ---------- 4) dispatch and navigate ----------
        dispatch(setUser({ ...result.user, subscriptionPlan: subscriptionData ?? [] }));
        router.replace("/dashboard");
      } catch (err) {
        console.error("Authentication callback error:", err);
        router.replace("/sign-in");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, dispatch]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-10 w-10 animate-spin text-black" />
        <h3 className="text-xl font-bold">Authenticating...</h3>
        <p>Please wait while we verify your credentials</p>
      </div>
    </div>
  );
}
