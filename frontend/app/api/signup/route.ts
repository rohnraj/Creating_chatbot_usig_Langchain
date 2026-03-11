import { NextResponse } from "next/server";
import { createUser } from "@/services/signupServices";
import { getAccessToken, getRefreshToken } from "@/utils/utility";

export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    const newUser = await createUser(name, email, password);
    if (newUser.userId) {
        // getAccessToken(newUser.userId);
        // getRefreshToken(newUser.userId);
        return NextResponse.json({ message: newUser.message }, { status: 201 });
    } else {
        return NextResponse.json({ error: newUser.message }, { status: 500 });
    }
}