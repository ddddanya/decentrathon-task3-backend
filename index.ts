import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import apiRoutes from "./routes/api";

import cron from "./helpers/cron";

import { mongoDB } from "./config";

const app = express();

mongoose
  .connect(mongoDB.uri)
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(cors());

// app.use((req, res, next) => {
//   if (req.headers['referer'] !== "https://decentrathon.undefined.ink/") {
//     return res.status(403)
//   }
//   next()
// })

app.use("/api", apiRoutes);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

cron();
