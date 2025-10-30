"use server";

import { createClient } from "@supabase/supabase-js";

// one “headless” client, no cookies
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Accept an access-token from the browser and return the verified user.
 */
export async function onAuthenticatedUser(accessToken: string) {
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { status: 403, error: "User not authenticated" };

  return { status: 200, user };
}
