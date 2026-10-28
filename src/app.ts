import express from "express";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes";
import { setupSwagger } from "./docs/swaggerSetup";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
