import mongoose from "mongoose";
import { env } from "./env";
import { Db } from "mongodb";

export let database: Db;

mongoose
  .connect(env.MONGODB_CONN)
  .then(({ connection }) => {
    database = connection.db!;

    console.log("mongoose connected!");
  })
  .catch(() => console.error("failed connecting"));
