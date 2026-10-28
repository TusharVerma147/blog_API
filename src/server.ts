import app from "./app";
import { config } from "./constants/config";
import { connectDatabase } from "./providers/database/connection";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
