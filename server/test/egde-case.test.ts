import request from "supertest";
import express from "express";
import routers from "../routes/index";

const app = express();
app.use(express.json());
app.use("/api", routers);

