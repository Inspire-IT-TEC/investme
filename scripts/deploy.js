#!/usr/bin/env node

// Deployment Script for Different Environments

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ENVIRONMENTS = {
  development: {
    branch: 'develop',
    description: 'Development environment for testing and development'
  },
  staging: {
    branch: 'staging',
    description: 'Staging environment for pre-production testing'
  },
  production: {
    branch: 'main',
    description: 'Production environment for live users'
  }
};

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'main';
  }
}

function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  } catch (error) {
    return 'unknown';
  }
}

function validateEnvironment(env) {
  if (!ENVIRONMENTS[env]) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error(`Available environments: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }
}

function checkBranch(env, currentBranch) {
  const expectedBranch = ENVIRONMENTS[env].branch;
  if (currentBranch !== expectedBranch) {
    console.warn(`⚠️  Warning: Deploying ${env} from branch '${currentBranch}' instead of '${expectedBranch}'`);
  }
}

function deployToEnvironment(env) {
  console.log(`\n🚀 Starting deployment to ${env.toUpperCase()} environment`);
  
  const currentBranch = getCurrentBranch();
  const currentCommit = getCurrentCommit();
  
  checkBranch(env, currentBranch);
  
  console.log(`📋 Deployment Details:`);
  console.log(`   Environment: ${env}`);
  console.log(`   Branch: ${currentBranch}`);
  console.log(`   Commit: ${currentCommit}`);
  console.log(`   Description: ${ENVIRONMENTS[env].description}`);
  
  // Set environment variable for deployment
  process.env.DEPLOY_ENV = env;
  
  console.log(`\n✅ Deployment configuration set for ${env.toUpperCase()}`);
  console.log(`   Use Replit Deploy button to deploy this configuration`);
  console.log(`   Environment will be automatically detected in production`);
}

function showHelp() {
  console.log(`
📦 InvestMe Deployment Script

Usage:
  npm run deploy [environment]

Environments:
  development  - Deploy to development (branch: develop)
  staging      - Deploy to staging (branch: staging)  
  production   - Deploy to production (branch: main)

Examples:
  npm run deploy development
  npm run deploy staging
  npm run deploy production

Current Git Status:
  Branch: ${getCurrentBranch()}
  Commit: ${getCurrentCommit()}

Note: This script prepares the deployment configuration.
Use the Replit Deploy button to actually deploy the application.
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help') {
  showHelp();
  process.exit(0);
}

validateEnvironment(command);
deployToEnvironment(command);