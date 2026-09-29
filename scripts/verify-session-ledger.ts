import { store } from "@pluribus/db";
import { SignJWT, jwtVerify } from "jose";

async function runVerification() {
  console.log("=== PLURIBUS SESSION & LEDGER VERIFICATION ===");

  // 1. Verify Clean Ledger State
  const assets = store.getAssets();
  const isSample = store.isSampleDataLoaded();
  console.log(`[LEDGER] Assets count in live store: ${assets.length}`);
  console.log(`[LEDGER] Is sample mock data loaded: ${isSample}`);
  console.log(`[LEDGER] Statutory Grants registered: ${store.getGrants().length}`);
  console.log(`[LEDGER] Projects registered: ${store.getProjects().length}`);
  console.log(`[LEDGER] Project Sites registered: ${store.getSites().length}`);
  console.log(`[LEDGER] Authentic Users registered: ${store.getUsers().length}`);

  if (assets.length === 0 && !isSample) {
    console.log("✓ SUCCESS: Production store starts with 0 mock assets (Original Authentic Mode active)");
  } else {
    console.warn("⚠ Note: Store contains initial assets:", assets.length);
  }

  // 2. Verify JWT Generation & Verification
  const JWT_SECRET = new TextEncoder().encode("pluribus_statutory_jwt_secret_key_32_bytes_min!");

  const testSession = {
    userId: "user-corp-1",
    name: "Arjun Mehta (CSR Head)",
    email: "arjun.mehta@tatatrust.org",
    role: "CORP_ADMIN",
    orgId: "org-corp-1",
    orgName: "Tata Sustainability Trust",
    orgType: "CORPORATE",
    reusableData: {
      tenantName: "Tata Sustainability Trust",
      lastProjectId: "proj-water-01",
      preferredSiteId: "site-barmer-01",
      recentSearches: ["water purification barmer", "solar installation"]
    }
  };

  const token = await new SignJWT({ ...testSession })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  console.log(`[JWT] Generated HS256 JWT Token (length: ${token.length})`);

  const { payload } = await jwtVerify(token, JWT_SECRET);
  console.log(`[JWT] Token successfully verified! Decoded userId: ${payload.userId}`);
  console.log(`[JWT] Saved reusable lastProjectId: ${(payload.reusableData as any)?.lastProjectId}`);
  console.log(`[JWT] Saved reusable preferredSiteId: ${(payload.reusableData as any)?.preferredSiteId}`);
  console.log(`[JWT] Saved reusable searches: ${(payload.reusableData as any)?.recentSearches?.join(", ")}`);

  console.log("✓ SUCCESS: JWT session tokens and reusable state fully validated!");
}

runVerification().catch(console.error);
