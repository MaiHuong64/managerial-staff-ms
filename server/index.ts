import express from "express";
import pool from "./config/db";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
console.log('Static path:', path.join(__dirname, "uploads"));
pool.query("SELECT NOW()")
    .then(res => console.log("Database connected:", res.rows[0]))
    .catch(err => console.error("Database connection error:", err));

app.listen(8000, () => {
  console.log("Server running on port 8000");
});