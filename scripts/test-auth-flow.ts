import { store } from "@pluribus/db";
import { SignJWT, jwtVerify } from "jose";

async function testRegistrationAndLogin() {
  console.log("=== TESTING REGISTRATION & LOGIN PIPELINE ===");

  const initialUserCount = store.getUsers().length;
  console.log(`Initial authentic users in store: ${initialUserCount}`);

  // Test 1: Register new user
  const newEmail = `officer_${Date.now()}@ruralimpact.org`;
  const newUserId = `user-${Date.now()}`;
  const orgName = "Jal Jeevan Sahayog Trust";
  const newOrgId = `org-${Date.now()}`;

  const registeredOrg = store.insertOrg({
    id: newOrgId,
    name: orgName,
    slug: "jal-jeevan",
    type: "NGO",
    createdAt: new Date().toISOString()
  });
  console.log(`[AUTH] Inserted Organization: ${registeredOrg.name} (${registeredOrg.id})`);

  const registeredUser = store.insertUser({
    id: newUserId,
    orgId: registeredOrg.id,
    role: "NGO_ADMIN",
    name: "Sunita Deshmukh",
    email: newEmail,
    phone: "+91 91234 56789",
    language: "mr",
    password: "secretPassword123"
  });
  console.log(`[AUTH] Registered new user: ${registeredUser.name} <${registeredUser.email}>`);

  // Verify user retrieval by email
  const retrieved = store.getUserByEmail(newEmail);
  if (!retrieved || retrieved.id !== newUserId) {
    throw new Error("Failed to retrieve user by email!");
  }
  console.log("✓ SUCCESS: Retrieved newly registered user by email");

  // Verify password check
  if (retrieved.password !== "secretPassword123") {
    throw new Error("Password mismatch!");
  }
  console.log("✓ SUCCESS: Password verification passed");

  // Generate JWT Session for newly registered user
  const JWT_SECRET = new TextEncoder().encode("pluribus_statutory_jwt_secret_key_32_bytes_min!");
  const sessionPayload = {
    userId: registeredUser.id,
    name: registeredUser.name,
    email: registeredUser.email,
    role: registeredUser.role,
    orgId: registeredOrg.id,
    orgName: registeredOrg.name,
    orgType: registeredOrg.type,
    reusableData: {
      tenantName: registeredOrg.name,
      recentSearches: ["water quality test"],
      customFilters: {}
    }
  };

  const token = await new SignJWT({ ...sessionPayload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const { payload } = await jwtVerify(token, JWT_SECRET);
  console.log(`✓ SUCCESS: Signed and verified JWT for registered user!`);
  console.log(`  Decoded Name: ${payload.name}`);
  console.log(`  Decoded Role: ${payload.role}`);
  console.log(`  Decoded Organization: ${payload.orgName}`);
  console.log(`  Decoded Reusable Tenant: ${(payload.reusableData as any).tenantName}`);

  console.log("\nALL AUTH REGISTRATION & LOGIN CHECKS PASSED!");
}

testRegistrationAndLogin().catch(console.error);
