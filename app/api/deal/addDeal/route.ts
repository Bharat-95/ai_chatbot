// app/api/deal/addDeal/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, vehicle, vin, profit, commission, dealData, user_id } = body;

  try {
    const { data, error } = await supabase.from("calculations").insert([
      {
        client_name: clientName,
        vehicle,
        vin,
        profit,
        commission,
        deal_data: dealData,
         user_id: user_id,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: "Deal saved", data }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving deal:", error.message);
    return NextResponse.json(
      { message: "Failed to add deal", error: error.message },
      { status: 500 }
    );
  }
}
