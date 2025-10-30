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
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const result = await onAuthenticatedUser(session.access_token);

      if (result.status === 200 && result.user) {
        const userId = result.user.id;
        const email = result.user.email ?? "";
        const fullName = result.user.user_metadata.full_name ?? "";
        const phone = result.user.phone ?? "";
        const role = "user";
        const status = "active";
        const prompt = `Go through the transcript and reply according to the following rules:

If the Client has already shared his phone number then reply him that one our reps will contact him and generate a unique line every time.
Use this message : "One of my team members will contact you and discuss details soon."

If the Client has not shared his phone number then ask him to share his phone number so that one of our reps can contact him.
Use this message : "Hi {{name}}, please leave your number and my team will contact you."

If the Client has already shared his phone number and the last reply is something else like ‘ok’ or ‘thanks’ or something that is ending the conversation then reply him ‘👍’ or ‘Your Welcome’ or ‘Ok’ or something simple and positive.`;

        const aiId = process.env.NEXT_PUBLIC_OPEN_AI_ID;

        const webHook = process.env.NEXT_PUBLIC_CHATBOT_LEADS_WEBHOOK;
        const newUserWebhook = process.env.NEXT_PUBLIC_NEW_USER_WEBHOOK;

        const { data: existingUser } = await supabaseBrowser
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (!existingUser) {
          const { error: insertError } = await supabaseBrowser
            .from("users")
            .insert([
              {
                id: userId,
                email,
                name: fullName,
                phone,
                role,
                status,
                fb_chatbot_prompt: prompt,
                fb_chatbot_open_ai_id: aiId,
                fb_chatbot_webhook: webHook,
                fb_chatbot_subscription_active: false,
                fb_chatbot_trail_active: false,
                new_user: true,
                is_anonymous: false,
                fb_chatbot_user_blocked: false,
              },
            ]);

          if (insertError) {
            console.error("Error inserting user:", insertError);
          } else {
            try {
              const payload = {
                id: userId ?? "User Id not Found",
                email: email ?? "No Email Found",
              };

              console.log("payload", payload);

              const response = await fetch(
                newUserWebhook,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                }
              );

              const responseText = await response.text();
              console.log(
                "✅ Webhook response:",
                response.status,
                responseText
              );
            } catch (err) {
              console.error("❌ Error calling webhook:", err);
            }
          }
        }

        await supabaseBrowser
          .from("users")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", userId);

        const { data } = await supabaseBrowser
          .from("user_subscription")
          .select("*")
          .eq("user_id", userId);

        dispatch(setUser({ ...result.user, subscriptionPlan: data }));
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }

      setLoading(false);
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
