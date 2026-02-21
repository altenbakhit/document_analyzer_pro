import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { name, phone, email, message, privacy_agreement } = await request.json();

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!privacy_agreement) {
      return NextResponse.json({ error: "Privacy agreement required" }, { status: 400 });
    }

    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      message: message.trim(),
      privacy_agreement,
    });

    if (error) {
      console.error("Supabase contact insert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
