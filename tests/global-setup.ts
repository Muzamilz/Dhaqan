import "dotenv/config";
import { execFileSync } from "node:child_process";
import { Client } from "pg";
import type { TestProject } from "vitest/node";

function urlWithDatabase(connectionString: string, database: string): URL {
  const url = new URL(connectionString);
  url.pathname = `/${database}`;
  url.search = "";
  return url;
}

export default async function setup({ provide }: TestProject) {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  const testUrl =
    process.env.TEST_DATABASE_URL ??
    urlWithDatabase(baseUrl, "dhaqan_test").toString();
  const testDatabase = new URL(testUrl).pathname.slice(1);
  const adminUrl = urlWithDatabase(baseUrl, "postgres").toString();

  async function runOnAdmin(sql: string) {
    const client = new Client({ connectionString: adminUrl });
    await client.connect();
    try {
      await client.query(sql);
    } finally {
      await client.end();
    }
  }

  await runOnAdmin(`DROP DATABASE IF EXISTS "${testDatabase}" WITH (FORCE)`);
  await runOnAdmin(`CREATE DATABASE "${testDatabase}"`);

  execFileSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });

  provide("dbUrl", testUrl);

  return async () => {
    await runOnAdmin(`DROP DATABASE IF EXISTS "${testDatabase}" WITH (FORCE)`);
  };
}
