import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getUserDetails } from "@/services/loignServices";
import { getAccessToken, getRefreshToken } from "@/utils/utility";


export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        // Handle login logic here
        const userExist = await (getUserDetails(email) as any);
        if (!userExist) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const passwordMatch = await bcrypt.compare(password, userExist.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        getAccessToken(userExist);
        getRefreshToken(userExist);
        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: userExist.id,
                name: userExist.name ?? userExist.email.split("@")[0],
                email: userExist.email,
            },
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}