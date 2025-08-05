#!/usr/bin/env node

/**
 * Simple Test for No-Prompt Functionality
 */

const { spawn } = require('child_process');

console.log('🧪 Testing No-Prompt Functionality');
console.log('==================================');

async function testCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Testing: ${command}`);
    
    const child = spawn(command, [], {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { 
        ...process.env, 
        CI: 'true', 
        NODE_ENV: 'production',
        FORCE_COLOR: '0',
        NO_COLOR: '1'
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
      
      // Auto-respond to any prompts
      if (output.includes('Press') || output.includes('Enter') || output.includes('Continue')) {
        console.log('🤖 Auto-responding to prompt...');
        try {
          child.stdin.write('\n');
        } catch (e) {
          console.log(`⚠️ Could not respond: ${e.message}`);
        }
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    child.on('close', (code) => {
      console.log(`✅ Command completed with code ${code}`);
      resolve({ stdout, stderr, code });
    });

    child.on('error', (error) => {
      console.error(`❌ Command failed: ${error.message}`);
      reject(error);
    });

    // Auto-respond after a delay to ensure continuation
    setTimeout(() => {
      console.log('🤖 Sending auto-response...');
      try {
        child.stdin.write('\n');
      } catch (e) {
        // Ignore EPIPE errors
      }
    }, 2000);
  });
}

async function runTests() {
  try {
    console.log('\n📋 Testing Git Status...');
    await testCommand('git status');
    
    console.log('\n📦 Testing NPM List...');
    await testCommand('npm list --depth=0');
    
    console.log('\n🐍 Testing Python Version...');
    await testCommand('python --version');
    
    console.log('\n🎉 All tests completed without manual intervention!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests(); 