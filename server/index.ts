import express from "express";
import pool from "./config/db";
import router from "./routes/auth";
import staffRouter from "./routes/staff";
import ptcRouter from "./routes/pct"
import planningRouter from "./routes/planning"
import departmentRouter from "./routes/department"
import appointmentRouter from "./routes/appointment"

import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use("/api/staffs", staffRouter)
app.use("/api/pct", ptcRouter)
app.use("/api/plannings", planningRouter)
app.use("/api/departments", departmentRouter)
app.use("/api/appointments", appointmentRouter)

pool.query("SELECT NOW()")
    .then(res => console.log("Database connected:", res.rows[0]))
    .catch(err => console.error("Database connection error:", err));

app.listen(3000, () => {
  console.log("Server running on port 5000");
});