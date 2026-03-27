import path from "node:path";

export const E2E_AUTH_FILE = path.join(
  process.cwd(),
  "playwright/.auth/e2e-user.json",
);
