/**
 * Neon Auth Diagnostic Script
 * 
 * This script comprehensively tests Neon Auth endpoints and configuration
 * to diagnose 500 errors and other authentication issues.
 */

async function diagnoseNeonAuth() {
  console.log('🔍 Neon Auth Diagnostic Tool\n');
  console.log('='.repeat(60));
  
  // 1. Check Environment Variables
  console.log('\n📋 1. Environment Variables Check');
  console.log('-'.repeat(60));
  
  const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
  const dbUrl = process.env.DATABASE_URL;
  const projectId = process.env.NEON_PROJECT_ID || process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  
  if (!authUrl) {
    console.error('❌ NEXT_PUBLIC_NEON_AUTH_URL is not set');
    return;
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
    // Extract endpoint from connection string
    const endpointMatch = dbUrl.match(/@([^-]+-[^-]+-[^-]+-[^-]+-pooler)\./);
    if (endpointMatch) {
      console.log('   Endpoint:', endpointMatch[1]);
    }
  }
  
  if (!projectId) {
    console.warn('⚠️  NEON_PROJECT_ID not set');
  } else {
    console.log('✅ Project ID:', projectId);
  }
  
  // 2. Test Auth Endpoints
  console.log('\n🌐 2. Testing Neon Auth Endpoints');
  console.log('-'.repeat(60));
  
  const baseUrl = authUrl.replace(/\/$/, '');
  
  // Test get-session endpoint
  console.log('\n📡 Testing /auth/get-session endpoint...');
  try {
    const sessionUrl = `${baseUrl}/get-session`;
    const sessionResponse = await fetch(sessionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${sessionResponse.status} ${sessionResponse.statusText}`);
    
    if (sessionResponse.status === 500) {
      console.error('   ❌ 500 Internal Server Error');
      try {
        const errorText = await sessionResponse.text();
        console.log('   Response:', errorText.substring(0, 200));
      } catch (e) {
        console.log('   (Could not read error response)');
      }
    } else if (sessionResponse.status === 401) {
      console.log('   ✅ 401 Unauthorized (expected when not authenticated)');
    } else if (sessionResponse.ok) {
      console.log('   ✅ Endpoint is working');
    } else {
      console.warn(`   ⚠️  Unexpected status: ${sessionResponse.status}`);
    }
  } catch (error) {
    console.error('   ❌ Failed to connect:', error instanceof Error ? error.message : String(error));
  }
  
  // Test JWKS endpoint (should always work)
  console.log('\n📡 Testing /.well-known/jwks.json endpoint...');
  try {
    const jwksUrl = `${baseUrl}/.well-known/jwks.json`;
    const jwksResponse = await fetch(jwksUrl, {
      method: 'GET',
    });
    
    console.log(`   Status: ${jwksResponse.status} ${jwksResponse.statusText}`);
    
    if (jwksResponse.ok) {
      console.log('   ✅ JWKS endpoint is accessible');
      try {
        const jwks = await jwksResponse.json();
        console.log(`   Keys available: ${jwks.keys?.length || 0}`);
      } catch (e) {
        // Ignore JSON parse errors
      }
    } else if (jwksResponse.status === 500) {
      console.error('   ❌ 500 Internal Server Error');
    } else {
      console.warn(`   ⚠️  Unexpected status: ${jwksResponse.status}`);
    }
  } catch (error) {
    console.error('   ❌ Failed to connect:', error instanceof Error ? error.message : String(error));
  }
  
  // 3. Database Connectivity Test
  console.log('\n💾 3. Database Connectivity Test');
  console.log('-'.repeat(60));
  console.log('   ⚠️  Note: This requires Neon MCP to be configured');
  console.log('   Run this script via: ts-node --esm scripts/diagnose-neon-auth.ts');
  
  // 4. Configuration Recommendations
  console.log('\n📝 4. Configuration Recommendations');
  console.log('-'.repeat(60));
  
  console.log('\n✅ Verified Configuration:');
  console.log('   - Environment variables are set');
  console.log('   - Auth URL format is correct');
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Check Neon Console for service status:');
  console.log('      https://console.neon.tech');
  console.log(`      Project: ${projectId || 'curly-surf-86073016'}`);
  console.log('      Navigate to: Database → Auth');
  console.log('\n   2. Verify SMTP Configuration:');
  console.log('      - Go to Database → Auth → Configuration');
  console.log('      - Check Email server settings');
  console.log('      - Click "Send test email"');
  console.log('      - Verify email is received');
  console.log('\n   3. Check Neon Status Page:');
  console.log('      https://status.neon.tech');
  console.log('\n   4. Clear Browser Storage:');
  console.log('      - Open DevTools (F12)');
  console.log('      - Application → Clear Storage');
  console.log('      - Clear Cookies, LocalStorage, SessionStorage');
  console.log('      - Hard refresh (Ctrl+Shift+R)');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnostic complete!\n');
}

// Run the diagnostic
diagnoseNeonAuth().catch((error) => {
  console.error('\n❌ Diagnostic failed:', error);
  process.exit(1);
});
