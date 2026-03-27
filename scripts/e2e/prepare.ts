import "dotenv/config";

import {
  disconnectE2EDataClients,
  ensureE2EAppFixtures,
  getE2EUserConfig,
  resetE2EAppState,
} from "../../tests/e2e/support/fixtures";

async function main() {
  const user = await ensureE2EAppFixtures();
  await resetE2EAppState();

  console.log("Prepared E2E fixtures");
  console.log(`  email: ${getE2EUserConfig().email}`);
  console.log(`  clerkId: ${user.id}`);
  console.log("  local app state reset: yes");
}

main()
  .catch((error) => {
    console.error("Failed to prepare E2E fixtures:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectE2EDataClients();
  });
