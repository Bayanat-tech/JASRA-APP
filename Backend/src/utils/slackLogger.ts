import axios from "axios";
import constants from "../helpers/constants";

const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 500;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const sendSlackMessage = async (message: string) => {
  const webhookUrl = constants.SLACK.WEBHOOK_URL;
  if (!webhookUrl) return;

  let lastError: any = null;
  for (let attempt = 0; attempt <= DEFAULT_RETRIES; attempt++) {
    try {
      const res = await axios.post(webhookUrl, { text: message }, { timeout: 5000 });
      if (res && (res.status === 200 || res.status === 201)) return;
      lastError = new Error(`Slack webhook responded with status ${res.status}`);
    } catch (err: any) {
      lastError = err;
    }

    if (attempt < DEFAULT_RETRIES) await delay(RETRY_DELAY_MS * (attempt + 1));
  }

  console.error("Slack Logger Error:", lastError?.message || lastError);
};

export default sendSlackMessage;