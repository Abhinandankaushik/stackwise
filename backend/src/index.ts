import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "512kb" }));

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(env.port, () => {
  console.log(`Stackwise API http://localhost:${env.port}`);
});
