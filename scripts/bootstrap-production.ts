/**
 * Pluribus Production Bootstrap & Seed Cleanup Utility
 * Prepares the production database environment by purging mock seed accounts
 * and initializing the root Super Administrator profile.
 */
import { store } from "@pluribus/db";

export async function bootstrapProduction(options: {
  purgeSeedData?: boolean;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}) {
  console.log("=== PLURIBUS ENTERPRISE: PRODUCTION BOOTSTRAP INITIALIZATION ===");

  const {
    purgeSeedData = false,
    adminEmail = "superadmin@pluribus-vault.org",
    adminName = "Pluribus Statutory Auditor General",
    adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "VaultSecure#2026!Prod"
  } = options;

  if (purgeSeedData) {
    console.log("1. Purging mock sample assets, reports, and seed derivatives...");
    store.clearSampleData();
    console.log("   ✓ Sample data wiped clean.");
  }

  console.log("2. Checking root Super Administrator profile...");
  let superAdmin = store.getUserByEmail(adminEmail);

  if (!superAdmin) {
    // Create root organization
    const rootOrg = store.insertOrg({
      id: "org-pluribus-statutory-root",
      name: "Pluribus Statutory Oversight Council",
      slug: "pluribus-statutory-oversight",
      type: "ASSESSOR",
      createdAt: new Date().toISOString(),
      complianceStatus: "verified"
    });

    superAdmin = store.insertUser({
      id: "user-super-root",
      orgId: rootOrg.id,
      role: "SUPER",
      name: adminName,
      email: adminEmail,
      language: "en",
      password: adminPassword
    });

    console.log(`   ✓ Provisioned Super Admin: ${superAdmin.name} <${superAdmin.email}>`);
  } else {
    console.log(`   ✓ Super Admin already exists: <${superAdmin.email}>`);
  }

  // Record to audit ledger
  store.logAudit({
    actor: superAdmin.name,
    action: "system.production_bootstrap",
    entity: "system",
    entityId: "prod-bootstrap-01",
    after: {
      timestamp: new Date().toISOString(),
      purgedSeedData: purgeSeedData,
      adminEmail: superAdmin.email
    }
  });

  console.log("3. System audit log entry committed.");
  console.log("\n=== PRODUCTION BOOTSTRAP COMPLETED SUCCESSFULLY ===");
  return { success: true, superAdmin };
}

// Direct execution test
if (process.argv.includes("--run")) {
  bootstrapProduction({ purgeSeedData: true }).catch(console.error);
}
