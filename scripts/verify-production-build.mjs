#!/usr/bin/env node

const blocked = [
  ["NEXT_PUBLIC_SKIP_ADMIN_CHECK", "true"],
  ["NEXT_PUBLIC_ENABLE_SEED", "true"],
  ["AI_SKIP_ADMIN_VERIFY", "true"],
];

const failures = blocked.filter(([key, value]) => process.env[key] === value);

if (failures.length > 0) {
  console.error("Production build blocked — unsafe environment flags detected:");
  for (const [key] of failures) {
    console.error(`  - ${key}=true`);
  }
  process.exit(1);
}

console.log("Production build env check passed.");
