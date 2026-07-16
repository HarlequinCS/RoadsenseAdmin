#!/usr/bin/env node
/**
 * One-time script to grant admin access to a Firebase Auth user.
 *
 * Prerequisites:
 *   1. Download service account JSON from Firebase Console:
 *      Project Settings → Service accounts → Generate new private key
 *   2. npm install firebase-admin (run from project root)
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs user@example.com /path/to/serviceAccountKey.json
 *
 * After running, the user must sign out and sign back in to refresh their token.
 */

import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const email = process.argv[2];
const keyPath = process.argv[3];

if (!email || !keyPath) {
  console.error("Usage: node scripts/set-admin-claim.mjs <email> <serviceAccountKey.json>");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { admin: true });

console.log(`✓ Admin claim set for: ${email}`);
console.log(`  UID: ${user.uid}`);
console.log(`\nUser must sign out and sign back in for the claim to take effect.`);

process.exit(0);
