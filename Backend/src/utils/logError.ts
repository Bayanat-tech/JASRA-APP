import { sendSlackMessage } from "./slackLogger";
import constants from "../helpers/constants";

export const logError = async (err: any, context: { url?: string; method?: string; note?: string } = {}) => {
  try {
    const env = process.env.NODE_ENV || "LOCAL";
    const parts: string[] = [];
    parts.push(`*${env} ERROR*`);
    parts.push(new Date().toISOString());
    if (context.method && context.url) parts.push(`${context.method} ${context.url}`);
    if (context.note) parts.push(`Note: ${context.note}`);

    if (err) {
      if (err.message) parts.push(`Message: ${err.message}`);
      if (err.stack) parts.push(`Stack:\n${err.stack}`);
      else parts.push(`Error: ${String(err)}`);
    }

    const text = parts.join("\n");

    // send to slack, swallow errors to avoid crash
    await sendSlackMessage(text);
  } catch (e: any) {
    console.error("logError failed:", e?.message || e);
  }
};

export default logError;
