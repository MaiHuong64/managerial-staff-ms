    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";
    import dotenv from "dotenv";
    import { AuthRepository } from "./auth.repository";

    dotenv.config();

    export const AuthService = {
        register: async (username: string, password: string, role: string) => {
            const exists = await AuthRepository.checkExistUser(username);
            if (exists) throw new Error("User already exists");

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            return await AuthRepository.createUser(username, hashedPassword, role);
        },

        login: async (username: string, password: string) => {
            const user = await AuthRepository.findByUsername(username);
            if (!user) throw new Error("Invalid credentials");

            const validPass = await bcrypt.compare(password, user.mat_khau);
            if (!validPass) throw new Error("Invalid credentials");

            const token = jwt.sign(
                {
                    id: user.id,
                    ten_dang_nhap: user.ten_dang_nhap,
                    vai_tro: user.vai_tro,
                    don_vi_id: user.don_vi_id,
                    ho_va_ten: user.ho_va_ten
                },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );

            return {
                id: user.id,
                ten_dang_nhap: user.ten_dang_nhap,
                vai_tro: user.vai_tro,
                don_vi_id: user.don_vi_id,
                ho_va_ten: user.ho_va_ten,  
                token
            };
        }
    };