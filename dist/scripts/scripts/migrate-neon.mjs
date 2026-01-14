/**
 * Neon Migration Script using MCP
 *
 * This script uses Neon MCP tools to safely apply migrations with branching support.
 *
 * Workflow:
 * 1. Generate migration SQL from Drizzle
 * 2. Use Neon MCP to prepare migration on a temporary branch
 * 3. Test migration on branch
 * 4. Complete migration to main branch
 *
 * Usage:
 *   pnpm migrate:neon --project-id <project-id> --sql <migration-file>
 *   pnpm migrate:neon --project-id <project-id> --auto (uses latest migration)
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
/**
 * Get the latest migration file from drizzle directory
 */
function getLatestMigration() {
    const drizzleDir = join(process.cwd(), "drizzle");
    try {
        const files = readdirSync(drizzleDir)
            .filter((f) => f.endsWith(".sql"))
            .map((f) => ({
            name: f,
            path: join(drizzleDir, f),
            mtime: statSync(join(drizzleDir, f)).mtime,
        }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        return files.length > 0 ? files[0].path : null;
    }
    catch (error) {
        console.error("❌ Error reading drizzle directory:", error);
        return null;
    }
}
/**
 * Read migration SQL from file
 */
function readMigrationSQL(filePath) {
    try {
        return readFileSync(filePath, "utf-8");
    }
    catch (error) {
        console.error(`❌ Error reading migration file ${filePath}:`, error);
        process.exit(1);
    }
}
/**
 * Main migration function
 *
 * Note: This script provides the structure. The actual MCP calls
 * should be made through the MCP client or CLI.
 */
async function migrateWithNeon(options) {
    console.log("🚀 Starting Neon Migration with Branching Support\n");
    // Get migration SQL
    let migrationSQL;
    if (options.auto) {
        const latestMigration = getLatestMigration();
        if (!latestMigration) {
            console.error("❌ No migration files found in drizzle/ directory");
            console.log("💡 Run 'pnpm db:generate' first to create a migration");
            process.exit(1);
        }
        console.log(`📄 Using latest migration: ${latestMigration}\n`);
        migrationSQL = readMigrationSQL(latestMigration);
    }
    else if (options.sqlFile) {
        migrationSQL = readMigrationSQL(options.sqlFile);
    }
    else {
        console.error("❌ Either --sql-file or --auto must be provided");
        process.exit(1);
    }
    console.log("📋 Migration SQL:");
    console.log("─".repeat(60));
    console.log(migrationSQL);
    console.log("─".repeat(60));
    console.log();
    // Instructions for using Neon MCP
    console.log("📝 Next Steps:");
    console.log();
    console.log("1. Use Neon MCP to prepare migration:");
    console.log(`   prepare_database_migration({`);
    console.log(`     projectId: "${options.projectId}",`);
    console.log(`     databaseName: "${options.databaseName || "neondb"}",`);
    console.log(`     migrationSql: ${JSON.stringify(migrationSQL)},`);
    console.log(`   })`);
    console.log();
    console.log("2. Test the migration on the temporary branch");
    console.log();
    console.log("3. If successful, complete the migration:");
    console.log(`   complete_database_migration({`);
    console.log(`     migrationId: "<from-prepare-response>",`);
    console.log(`     projectId: "${options.projectId}",`);
    console.log(`     databaseName: "${options.databaseName || "neondb"}",`);
    console.log(`     migrationSql: ${JSON.stringify(migrationSQL)},`);
    console.log(`     temporaryBranchId: "<from-prepare-response>",`);
    console.log(`     parentBranchId: "<main-branch-id>",`);
    console.log(`     applyChanges: true,`);
    console.log(`   })`);
    console.log();
    console.log("💡 See scripts/migrate-neon-mcp.ts for automated version");
}
// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    projectId: "",
};
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
        case "--project-id":
            options.projectId = args[++i];
            break;
        case "--sql-file":
            options.sqlFile = args[++i];
            break;
        case "--auto":
            options.auto = true;
            break;
        case "--database":
            options.databaseName = args[++i];
            break;
        case "--apply":
            options.apply = true;
            break;
        case "--help":
            console.log(`
Neon Migration Script

Usage:
  pnpm migrate:neon --project-id <id> [options]

Options:
  --project-id <id>     Neon project ID (required)
  --sql-file <path>     Path to migration SQL file
  --auto                Use latest migration from drizzle/
  --database <name>     Database name (default: neondb)
  --apply               Apply to main branch after testing
  --help                Show this help

Examples:
  pnpm migrate:neon --project-id abc123 --auto
  pnpm migrate:neon --project-id abc123 --sql-file drizzle/0000_initial.sql
      `);
            process.exit(0);
    }
}
if (!options.projectId) {
    console.error("❌ --project-id is required");
    console.log("💡 Get your project ID from Neon dashboard or use: pnpm neon:list-projects");
    process.exit(1);
}
migrateWithNeon(options).catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});
