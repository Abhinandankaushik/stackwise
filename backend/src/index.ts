import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { connectDatabase } from "./config/database.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "512kb" }));

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Stackwise API http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("[stackwise] DB connection failed on startup:", err);
    app.listen(port, () => {
      console.log(`Stackwise API http://localhost:${port} (without DB)`);
    });
  });
