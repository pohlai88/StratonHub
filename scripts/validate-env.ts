/**
 * Validate .env file lines 21-24
 * Specifically checks Neon Auth configuration
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnvValidation {
  line: number;
  key: string;
  value: string | null;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateEnvLines() {
  const envPath = join(process.cwd(), '.env');
  let lines: string[] = [];
  
  try {
    const content = readFileSync(envPath, 'utf-8');
    lines = content.split('\n');
  } catch (error) {
    console.error('❌ Could not read .env file:', error);
    console.log('\n💡 Make sure .env file exists in the project root');
    return;
  }

  console.log('🔍 Validating .env file lines 21-24...\n');
  console.log('='.repeat(60));

  const validations: EnvValidation[] = [];
  const targetLines = [21, 22, 23, 24];

  // Expected keys for lines 21-24 (based on Neon Auth setup)
  const expectedKeys = [
    'NEXT_PUBLIC_NEON_AUTH_URL',
    'NEON_PROJECT_ID',
    'NEON_DATABASE_NAME',
    // Line 24 could be another env var or empty
  ];

  targetLines.forEach((lineNum, index) => {
    const lineIndex = lineNum - 1; // Convert to 0-based index
    const line = lines[lineIndex] || '';
    const trimmed = line.trim();

    const validation: EnvValidation = {
      line: lineNum,
      key: '',
      value: null,
      valid: false,
      errors: [],
      warnings: [],
    };

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      validation.valid = true;
      validation.warnings.push('Empty line or comment');
      validations.push(validation);
      return;
    }

    // Parse key=value
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      validation.errors.push('Invalid format (should be KEY=value)');
      validations.push(validation);
      return;
    }

    const [, key, value] = match;
    validation.key = key;
    validation.value = value;

    // Validate specific keys
    if (key === 'NEXT_PUBLIC_NEON_AUTH_URL') {
      // Check if it's the new provisioned URL
      if (value.includes('ep-white-boat-a189xlni')) {
        validation.valid = true;
        validation.warnings.push('✅ Using new provisioned auth URL');
      } else if (value.includes('ep-hidden-mountain-a1ckcj1m')) {
        validation.valid = false;
        validation.errors.push('❌ Using old/invalid auth URL - update to: https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth');
      } else if (!value.includes('neonauth')) {
        validation.valid = false;
        validation.errors.push('❌ Does not appear to be a valid Neon Auth URL');
      } else {
        validation.valid = true;
        validation.warnings.push('⚠️  Auth URL format looks correct, but verify it matches provisioned URL');
      }

      // Validate URL format
      const urlPattern = /^https:\/\/[a-z0-9-]+\.neonauth\.[a-z0-9-]+\.aws\.neon\.tech\/[^\/]+\/auth$/;
      if (!urlPattern.test(value)) {
        validation.errors.push('URL format may be incorrect');
      }
    } else if (key === 'NEON_PROJECT_ID') {
      if (value === 'silent-pine-17937740') {
        validation.valid = true;
        validation.warnings.push('✅ Correct project ID');
      } else {
        validation.valid = true;
        validation.warnings.push(`⚠️  Project ID: ${value} (expected: silent-pine-17937740)`);
      }
    } else if (key === 'NEON_DATABASE_NAME') {
      if (value === 'neondb') {
        validation.valid = true;
        validation.warnings.push('✅ Correct database name');
      } else {
        validation.valid = true;
        validation.warnings.push(`⚠️  Database: ${value} (expected: neondb)`);
      }
    } else {
      // Other keys are fine
      validation.valid = true;
      validation.warnings.push(`Key: ${key}`);
    }

    validations.push(validation);
  });

  // Display results
  let allValid = true;
  validations.forEach((v) => {
    const status = v.valid ? '✅' : '❌';
    console.log(`\nLine ${v.line}: ${status}`);
    
    if (v.key) {
      console.log(`  Key: ${v.key}`);
      if (v.value) {
        const displayValue = v.value.length > 80 
          ? v.value.substring(0, 80) + '...' 
          : v.value;
        console.log(`  Value: ${displayValue}`);
      }
    } else {
      console.log(`  Content: ${lines[v.line - 1]?.trim() || '(empty)'}`);
    }

    if (v.errors.length > 0) {
      allValid = false;
      v.errors.forEach((error) => console.log(`  ${error}`));
    }

    if (v.warnings.length > 0) {
      v.warnings.forEach((warning) => console.log(`  ${warning}`));
    }
  });

  console.log('\n' + '='.repeat(60));

  // Summary
  if (allValid) {
    console.log('\n✅ All lines are valid!');
  } else {
    console.log('\n❌ Some lines have errors. Please fix them.');
  }

  // Check if NEXT_PUBLIC_NEON_AUTH_URL is set correctly
  const authUrlLine = validations.find((v) => v.key === 'NEXT_PUBLIC_NEON_AUTH_URL');
  if (!authUrlLine || !authUrlLine.value) {
    console.log('\n⚠️  NEXT_PUBLIC_NEON_AUTH_URL not found in lines 21-24');
    console.log('   Expected value:');
    console.log('   NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth');
  }

  // Show recommended configuration
  console.log('\n📋 Recommended configuration for lines 21-24:');
  console.log(`
# Neon Auth URL (Updated from MCP provisioning)
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_PROJECT_ID=silent-pine-17937740
NEON_DATABASE_NAME=neondb
  `);
}

// Run validation
validateEnvLines();
