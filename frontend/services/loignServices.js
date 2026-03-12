import pool from "@/lib/db";
export const getUserDetails = async (email) => {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const value = [email];
        const result = await pool?.query(query, value);
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};
