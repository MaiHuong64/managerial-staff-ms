    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";
    import dotenv from "dotenv";
    import { AuthRepository } from "./auth.repository";
import { error } from "console";

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
            console.log(user)
            if (!user) throw new Error("Invalid credentials");

            const validPass = await bcrypt.compare(password, user.matKhau);
            if (!validPass) throw new Error("Invalid credentials");

            const userPayload = {
                id: user.id,
                tenDangNhap: user.tenDangNhap,
                vaiTro: user.vaiTro,
                donViId: user.donViId,
                hoVaTen: user.hoVaTen,
                vienChucId: user.vienChucId,
            };
            const token = jwt.sign(
                userPayload,
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );

            return {
                ...userPayload,  
                token
            };
        }
    };