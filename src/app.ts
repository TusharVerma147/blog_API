import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
