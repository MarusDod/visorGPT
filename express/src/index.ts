import express from "express";
import "express-async-errors";
import "./services/mongoose";
import { apiRouter } from "./routes/api";
import bodyParser from "body-parser";
import { loginRouter } from "./routes/auth";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware";
import { env } from "./services/env";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

const port = env.PORT ?? 3000;

app.get("/", (_, res) => {
  res.send("Hello world");
});

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5174", "https://visorgpt-vite.onrender.com/"],
    credentials: true,
  })
);
app.use(
  bodyParser.json({
    limit: "5mb",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/auth", loginRouter);
app.use("/api", authMiddleware, apiRouter);

app.use(async (err, req, res, next) => {
  res.status(500);

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`running at http://localhost:${port}...`);
});

process.on("uncaughtException", (err) => {
  mongoose.connection.close();
  console.log(`Uncaught Exception: ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
  console.log(`Unhandled rejection reason: ${reason}`);
  mongoose.connection.close();
  process.exit(1);
});
