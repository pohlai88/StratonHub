/**
 * Example: Complete Neon Migration Workflow with MCP
 *
 * This is a complete example showing how to use Neon MCP tools
 * for safe database migrations with branching support.
 *
 * To use this:
 * 1. Set NEON_PROJECT_ID in your .env file
 * 2. Ensure MCP server is configured
 * 3. Run: ts-node scripts/migrate-example.ts
 *
 * Note: This requires MCP tools to be available in your environment.
 * In Cursor/Claude, MCP tools are available directly.
 */
import { getLatestMigrationPath, readMigrationFile } from "./neon-utils";
/**
 * Example workflow using Neon MCP tools
 *
 * This function demonstrates the complete migration workflow.
 * In practice, you would call the MCP tools directly from your environment.
 */
async function exampleMigrationWorkflow() {
    console.log("🚀 Neon Migration Workflow Example\n");
    // Step 1: Get migration file
    const migrationPath = getLatestMigrationPath();
    if (!migrationPath) {
        console.error("❌ No migration files found");
        console.log("💡 Run 'pnpm db:generate' first");
        return;
    }
    console.log(`📄 Migration file: ${migrationPath}\n`);
    const migrationSQL = readMigrationFile(migrationPath);
    // Step 2: Get project ID
    const projectId = process.env.NEON_PROJECT_ID;
    if (!projectId) {
        console.error("❌ NEON_PROJECT_ID not set");
        console.log("💡 Add NEON_PROJECT_ID to your .env file");
        return;
    }
    const databaseName = process.env.NEON_DATABASE_NAME || "neondb";
    console.log("📋 Migration Details:");
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Database: ${databaseName}`);
    console.log(`   Migration: ${migrationPath}`);
    console.log();
    // Step 3: Prepare migration (MCP call)
    console.log("Step 1: Prepare migration on temporary branch");
    console.log("─".repeat(60));
    console.log("Call MCP tool:");
    console.log();
    console.log("mcp_Neon_prepare_database_migration({");
    console.log(`  projectId: "${projectId}",`);
    console.log(`  databaseName: "${databaseName}",`);
    console.log(`  migrationSql: ${JSON.stringify(migrationSQL)},`);
    console.log("})");
    console.log();
    console.log("This will:");
    console.log("  ✅ Create a temporary branch");
    console.log("  ✅ Apply migration SQL to the branch");
    console.log("  ✅ Return migrationId and branchId");
    console.log();
    // Step 4: Test migration
    console.log("Step 2: Test migration on temporary branch");
    console.log("─".repeat(60));
    console.log("After Step 1, you'll receive:");
    console.log("  - migrationId: '<unique-id>'");
    console.log("  - temporaryBranchId: '<branch-id>'");
    console.log("  - parentBranchId: '<main-branch-id>'");
    console.log();
    console.log("Get connection string for testing:");
    console.log();
    console.log("mcp_Neon_get_connection_string({");
    console.log(`  projectId: "${projectId}",`);
    console.log("  branchId: '<temporary-branch-id>',");
    console.log(`  databaseName: "${databaseName}",`);
    console.log("})");
    console.log();
    console.log("Then:");
    console.log("  ✅ Test your application with the branch connection");
    console.log("  ✅ Run your test suite");
    console.log("  ✅ Verify schema changes");
    console.log();
    // Step 5: Complete migration
    console.log("Step 3: Complete migration (if tests pass)");
    console.log("─".repeat(60));
    console.log("Call MCP tool:");
    console.log();
    console.log("mcp_Neon_complete_database_migration({");
    console.log("  migrationId: '<from-step-1>',");
    console.log(`  projectId: "${projectId}",`);
    console.log(`  databaseName: "${databaseName}",`);
    console.log(`  migrationSql: ${JSON.stringify(migrationSQL)},`);
    console.log("  temporaryBranchId: '<from-step-1>',");
    console.log("  parentBranchId: '<from-step-1>',");
    console.log("  applyChanges: true,");
    console.log("})");
    console.log();
    console.log("This will:");
    console.log("  ✅ Apply migration to main branch");
    console.log("  ✅ Delete temporary branch");
    console.log("  ✅ Return confirmation");
    console.log();
    // Step 6: Regenerate contracts
    console.log("Step 4: Regenerate contracts");
    console.log("─".repeat(60));
    console.log("After migration is complete:");
    console.log();
    console.log("  pnpm gen:db-contract");
    console.log();
    console.log("This updates Zod contracts from the new schema.");
    console.log();
    console.log("✨ Migration workflow complete!");
    console.log();
    console.log("📚 See .plan/NEON_MIGRATION_WORKFLOW.md for detailed documentation");
}
// Run example
exampleMigrationWorkflow().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
});
