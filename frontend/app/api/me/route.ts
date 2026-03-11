import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * GET /api/me
 *
 * Reads the httpOnly accessToken cookie server-side, verifies it,
 * and returns the user payload.  Used by the frontend on every page
 * load to check if the user is already logged in (the cookie is
 * invisible to browser JavaScript).
 *
 * Returns { user } on success, { user: null } with 401 if the token
 * is missing or invalid.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      name?: string;
    };

    return NextResponse.json({
      user: {
        id: payload.id,
        name: payload.name ?? payload.email.split("@")[0],
        email: payload.email,
        image: null,
      },
    });
  } catch {
    // Token expired or tampered
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
