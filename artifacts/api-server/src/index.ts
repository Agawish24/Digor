import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";
import { runEmailSequenceJob } from "./routes/crm/sequences";
import { runTaskAutomationCron } from "./services/automation";
import { pool } from "@workspace/db";

const port = Number(process.env["PORT"] || 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

seedDatabase().then(() => {
  app.listen(port, "0.0.0.0", (err?: Error) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening on 0.0.0.0");

    pool.query("SELECT 1").catch(() => {});
    setInterval(() => {
      for (let i = 0; i < 6; i++) pool.query("SELECT 1").catch(() => {});
    }, 8000);

    runEmailSequenceJob();
    setInterval(runEmailSequenceJob, 60 * 60 * 1000);

    runTaskAutomationCron();
    setInterval(runTaskAutomationCron, 60 * 60 * 1000);
  });
});
