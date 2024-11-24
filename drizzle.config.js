import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  dbCredentials: {
    url:"postgresql://ai-interview-mocker_owner:9QJ5fXRldZwg@ep-blue-lab-a89j892q.eastus2.azure.neon.tech/ai-interview-mocker?sslmode=require"
  }
});
