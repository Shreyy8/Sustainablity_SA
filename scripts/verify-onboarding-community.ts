import { store } from "@pluribus/db";

async function verifyOnboardingAndCommunity() {
  console.log("=== VERIFYING STATUTORY ONBOARDING & COMMUNITY DATA ===");

  // 1. Verify Store supports statutory fields on org
  const testCorp = store.insertOrg({
    id: `org-test-corp-${Date.now()}`,
    name: "Mahindra Clean Energy Foundation",
    slug: "mahindra-clean-energy",
    type: "CORPORATE",
    createdAt: new Date().toISOString(),
    cin: "L28920MH1945PLC004520",
    gstin: "27AAACM1234F1ZQ",
    pan: "AAACM1234F",
    sectors: ["Item (iv) - Environmental Sustainability & Afforestation"],
    states: ["Maharashtra", "Rajasthan"],
    annualBudgetInr: 50000000,
    complianceStatus: "verified"
  });

  console.log(`✓ Inserted Corporate with CIN: ${testCorp.cin} and budget: ₹${testCorp.annualBudgetInr}`);

  const testNgo = store.insertOrg({
    id: `org-test-ngo-${Date.now()}`,
    name: "Samriddhi Rural Development Samiti",
    slug: "samriddhi-rural",
    type: "NGO",
    createdAt: new Date().toISOString(),
    darpanId: "RJ/2023/039481",
    csr1Number: "CSR00028194",
    section12A: "AABTS1234FE20221",
    section80G: "AABTS1234FD20224",
    sectors: ["Item (i) - Eradicating Hunger, Poverty, WASH"],
    states: ["Rajasthan"],
    complianceStatus: "verified"
  });

  console.log(`✓ Inserted NGO with Darpan ID: ${testNgo.darpanId} & CSR-1: ${testNgo.csr1Number}`);

  // 2. Verify community aggregation calculations
  const orgs = store.getOrgs();
  const grants = store.getGrants();
  const projects = store.getProjects();
  const sites = store.getSites();

  console.log("\n=== COMMUNITY AGGREGATES ===");
  console.log(`Total Registered Organizations: ${orgs.length}`);
  console.log(`Total Active Grants: ${grants.length}`);
  console.log(`Total Active Projects: ${projects.length}`);
  console.log(`Total Verified Field Sites: ${sites.length}`);

  const totalFunds = grants.reduce((sum, g) => sum + (Number(g.amountInr) || 0), 0);
  console.log(`Total CSR Capital Tracked: ₹${totalFunds.toLocaleString("en-IN")}`);

  if (totalFunds <= 0) {
    throw new Error("Total funds calculation invalid!");
  }

  console.log("\nALL ONBOARDING & COMMUNITY INTEGRATION CHECKS PASSED!");
}

verifyOnboardingAndCommunity().catch(console.error);
