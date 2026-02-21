import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { notifyAdmin, contactNotificationEmail } from "@/lib/notify";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, phone, email, message, privacy_agreement } = await request.json();

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!privacy_agreement) {
      return NextResponse.json({ error: "Privacy agreement required" }, { status: 400 });
    }

    await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message.trim(),
        privacyAgreement: privacy_agreement,
      },
    });

    const { subject, html } = contactNotificationEmail({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      message: message.trim(),
    });
    await notifyAdmin(subject, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
