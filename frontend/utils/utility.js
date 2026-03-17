import { cookies } from "next/headers";
import { getUserDetails } from "../services/loignServices";
import jwt from "jsonwebtoken";

export const getAccessToken = async (user) => {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const cookieStore = await cookies();
    cookieStore.set("accessToken",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3600
        });
    return token;
};

export const getRefreshToken = async (user) => {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set("refreshToken",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 604800
        });
    return token;
};

