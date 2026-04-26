export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, buildAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 200, headers: { "Set-Cookie": buildAuthCookie(token) } }
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
