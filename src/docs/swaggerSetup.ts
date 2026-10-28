import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

export function setupSwagger(app: Express): void {
  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "Blog API Docs",
    })
  );
}
