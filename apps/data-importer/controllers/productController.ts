import { Handler, ScheduledEvent } from "aws-lambda";
import { ImportService } from "../services/productService";

const svc = new ImportService();

/**
 * Scheduled Lambda handler to run daily.
 * EventBridge will invoke this at 8 AM Beirut (configured via cron/timezone in serverless.yml).
 */
export const importHandler: Handler<ScheduledEvent> = async () => {
    // get YYYY-MM-DD for “today” in UTC+3
    /** const now = new Date();
    // adjust for Beirut timezone offset if running in UTC environment
    const beirutOffset = 3 * 60; // +3 hours in minutes
    const local = new Date(now.getTime() + beirutOffset * 60 * 1000);
    const date = local.toISOString().slice(0, 10);**/

    const date = new Date().toISOString().slice(0, 10);

    try {
        const count = await svc.importForDate(date);
        console.log(`✅ Imported ${count} items from ${date}/items.csv`);
    } catch (err: any) {
        console.error(`❌ Import failed for ${date}:`, err);
        throw err;
    }
};
