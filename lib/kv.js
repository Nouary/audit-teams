import { kv as vercelKv } from "@vercel/kv";
import fs from "fs";
import path from "path";

const localDbPath = path.join(process.cwd(), ".teams-local-db.json");

function getLocalData() {
  try {
    if (fs.existsSync(localDbPath)) {
      return JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
    }
  } catch (e) {
    console.error("Local DB read error:", e);
  }
  return {};
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Local DB write error:", e);
  }
}

// If Vercel KV credentials are provided, use Vercel KV.
// Otherwise, fall back to local file storage for effortless local development.
export const kv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? vercelKv
    : {
        hset: async (hash, fields) => {
          const data = getLocalData();
          data[hash] = { ...(data[hash] || {}), ...fields };
          saveLocalData(data);
          return 1;
        },
        hgetall: async (hash) => {
          const data = getLocalData();
          return data[hash] || {};
        },
      };
