import pool from "@/lib/db";
import bcrypt from "bcrypt";

export const createUser = async (name, email, password) => {
    try {
        // Check if user already exists
        const existingUserQuery = `SELECT * FROM users WHERE email = $1`;
        const existingUserValue = [email];
        const existingUserResult = await pool.query(existingUserQuery, existingUserValue);
        if (existingUserResult.rows.length > 0) {
            return { success: false, message: "User already exists" };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const insertUserQuery = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`;
        const insertUserValue = [name, email, hashedPassword];
        const insertUserResult = await pool.query(insertUserQuery, insertUserValue);
        
        if (insertUserResult.rows.length > 0) {
            const userId = insertUserResult.rows[0].id;
            return { success: true, userId, message: "User created successfully" };
        } else {
            return { success: false, message: "Failed to create user" };
        }
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, message: "An error occurred while creating the user" };
    }
}