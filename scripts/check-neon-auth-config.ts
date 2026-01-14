/**
 * Script to check Neon Auth configuration status
 * 
 * This script helps verify:
 * 1. Neon Auth is provisioned
 * 2. SMTP is configured (must be done in Neon Console)
 * 3. Environment variables are set correctly
 */

async function checkNeonAuthConfig() {
  console.log('🔍 Checking Neon Auth Configuration...\n');
  console.log('⚠️  IMPORTANT: SMTP must be configured in Neon Console for email OTP to work!\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
  const dbUrl = process.env.DATABASE_URL;

  if (!authUrl) {
    console.error('❌ NEXT_PUBLIC_NEON_AUTH_URL is not set');
  } else {
    console.log('✅ NEXT_PUBLIC_NEON_AUTH_URL:', authUrl);
    
    // Validate URL format
    const urlPattern = /https:\/\/.*\.neonauth\..*\.aws\.neon\.tech\/.*\/auth/;
    if (!urlPattern.test(authUrl)) {
      console.warn('⚠️  Auth URL format may be incorrect');
    }
  }

  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set');
  } else {
    console.log('✅ DATABASE_URL is set');
  }

  console.log('\n📧 SMTP Configuration:');
  console.log('⚠️  SMTP must be configured in Neon Console:');
  console.log('   1. Go to https://console.neon.tech');
  console.log('   2. Select your project');
  console.log('   3. Navigate to Database → Auth → Configuration');
  console.log('   4. Configure Custom SMTP server');
  console.log('   5. Test with "Send test email"');

  console.log('\n🧪 Testing Auth Endpoint:');
  if (authUrl) {
    try {
      const testUrl = authUrl.replace('/auth', '/auth/get-session');
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 500) {
        console.error('❌ Auth endpoint returns 500 - likely SMTP not configured');
        console.log('   → Configure SMTP in Neon Console');
        console.log('   → Or use: pnpm run check:auth-mcp to check via MCP');
      } else if (response.status === 404) {
        console.error('❌ Auth endpoint not found - Neon Auth may not be provisioned');
        console.log('   → Provision Neon Auth using MCP: mcp_Neon_provision_neon_auth()');
        console.log('   → Or use: pnpm run check:auth-mcp for MCP instructions');
      } else if (response.ok || response.status === 401) {
        console.log('✅ Auth endpoint is accessible');
      } else {
        console.warn(`⚠️  Auth endpoint returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to test auth endpoint:', error);
    }
  } else {
    console.log('⚠️  Cannot test endpoint - NEXT_PUBLIC_NEON_AUTH_URL not set');
    console.log('   → Use MCP to provision: mcp_Neon_provision_neon_auth()');
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Ensure Neon Auth is provisioned');
  console.log('2. Configure SMTP in Neon Console');
  console.log('3. Test email sending');
  console.log('4. Verify environment variables are set');
}

// Run if called directly
checkNeonAuthConfig().catch(console.error);

export { checkNeonAuthConfig };
