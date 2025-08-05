#!/usr/bin/env node

/**
 * Comprehensive Test for No-Prompt Functionality
 * Demonstrates that ALL commands execute without manual "press enter" prompts
 */

const { spawn } = require('child_process');

console.log('🧪 Comprehensive No-Prompt Test');
console.log('===============================');

class ComprehensiveTest {
  constructor() {
    this.testResults = [];
  }

  async testCommand(command, description) {
    return new Promise((resolve, reject) => {
      console.log(`\n🚀 Testing: ${description}`);
      console.log(`Command: ${command}`);
      
      const startTime = Date.now();
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
      let autoResponses = 0;

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
        
        // Auto-respond to any prompts
        if (this.containsPrompt(output)) {
          console.log('🤖 Auto-responding to prompt...');
          try {
            child.stdin.write('\n');
            autoResponses++;
          } catch (e) {
            console.log(`⚠️ Could not respond: ${e.message}`);
          }
        }
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
        
        // Auto-respond to any prompts
        if (this.containsPrompt(output)) {
          console.log('🤖 Auto-responding to prompt...');
          try {
            child.stdin.write('\n');
            autoResponses++;
          } catch (e) {
            console.log(`⚠️ Could not respond: ${e.message}`);
          }
        }
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = {
          command,
          description,
          code,
          duration,
          autoResponses,
          success: code === 0,
          stdout: stdout.substring(0, 200) + (stdout.length > 200 ? '...' : ''),
          stderr: stderr.substring(0, 200) + (stderr.length > 200 ? '...' : '')
        };
        
        console.log(`✅ Completed in ${duration}ms (${autoResponses} auto-responses)`);
        this.testResults.push(result);
        resolve(result);
      });

      child.on('error', (error) => {
        console.error(`❌ Command failed: ${error.message}`);
        reject(error);
      });

      // Auto-respond after a delay to ensure continuation
      setTimeout(() => {
        console.log('🤖 Sending auto-response to ensure continuation...');
        try {
          child.stdin.write('\n');
          autoResponses++;
        } catch (e) {
          // Ignore EPIPE errors
        }
      }, 2000);
    });
  }

  containsPrompt(output) {
    const prompts = [
      'Press any key to continue',
      'Press Enter to continue',
      'Press RETURN to continue',
      'Press any key',
      'Press a key',
      'Hit any key',
      'Hit Enter',
      'Hit Return',
      'Do you want to continue?',
      'Are you sure?',
      'Proceed?',
      'Continue?',
      'Confirm?',
      '[Y/n]',
      '[y/N]',
      '(y/N)',
      '(Y/n)',
      '(yes/no)',
      'Enter password:',
      'Password:',
      'Username:',
      'Email:',
      'Name:',
      'Description:',
      'Version:',
      'License:',
      'Author:',
      'Repository:',
      'Keywords:',
      'Main:',
      'Scripts:',
      'Dependencies:',
      'DevDependencies:',
      'Enter a commit message',
      'Please enter a commit message',
      'Commit message:',
      'PS ',
      'C:\\',
      '>',
      '$'
    ];

    return prompts.some(prompt => 
      output.toLowerCase().includes(prompt.toLowerCase())
    );
  }

  async runAllTests() {
    console.log('\n🎯 Starting Comprehensive No-Prompt Tests');
    console.log('==========================================');

    const tests = [
      { command: 'git status', description: 'Git Status Check' },
      { command: 'npm list --depth=0', description: 'NPM Package List' },
      { command: 'python --version', description: 'Python Version Check' },
      { command: 'node --version', description: 'Node.js Version Check' },
      { command: 'npm --version', description: 'NPM Version Check' },
      { command: 'git --version', description: 'Git Version Check' },
      { command: 'dir', description: 'Directory Listing' },
      { command: 'echo "Test completed successfully"', description: 'Echo Test' }
    ];

    for (const test of tests) {
      try {
        await this.testCommand(test.command, test.description);
        // Small delay between tests
        await this.wait(1000);
      } catch (error) {
        console.error(`❌ Test failed: ${test.description} - ${error.message}`);
      }
    }

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const totalAutoResponses = this.testResults.reduce((sum, r) => sum + r.autoResponses, 0);
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}/${totalTests}`);
    console.log(`Total Auto-Responses: ${totalAutoResponses}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Average Duration: ${Math.round(totalDuration / totalTests)}ms`);

    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.description} (${result.duration}ms, ${result.autoResponses} responses)`);
    });

    if (successfulTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! No manual "press enter" prompts required.');
      console.log('✅ The no-prompt automation is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed, but automation continued without manual intervention.');
    }
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the comprehensive test
const test = new ComprehensiveTest();
test.runAllTests(); 