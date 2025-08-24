#!/usr/bin/env node

/**
 * Test ANY Command with Auto-Continuation
 * This script can test any command and ensure it doesn't wait for manual "press enter"
 */

const { spawn } = require('child_process');

console.log('🧪 Testing ANY Command with Auto-Continuation');
console.log('=============================================');

class TestAnyCommand {
  constructor() {
    this.prompts = [
      // Press any key prompts
      'Press any key to continue',
      'Press Enter to continue',
      'Press RETURN to continue',
      'Press any key',
      'Press a key',
      'Hit any key',
      'Hit Enter',
      'Hit Return',
      'Press any key when ready',
      'Press any key to exit',
      'Press any key to close',
      
      // Confirmation prompts
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
      '(Yes/No)',
      '(true/false)',
      '(True/False)',
      
      // Input prompts
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
      
      // Git prompts
      'Enter a commit message',
      'Please enter a commit message',
      'Commit message:',
      
      // PowerShell/Command prompt
      'PS ',
      'C:\\',
      '>',
      '$',
      
      // Windows specific
      'Press any key when ready',
      'Press any key to exit',
      'Press any key to close',
      
      // Generic waiting patterns
      'waiting',
      'wait',
      'pause',
      'stopped',
      'halted',
      'suspended',
      'blocked',
      'stuck'
    ];
  }

  async testCommand(command) {
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
          NO_COLOR: '1',
          TERM: 'dumb',
          // Disable interactive prompts
          DEBIAN_FRONTEND: 'noninteractive',
          APT_LISTCHANGES_FRONTEND: 'none',
          UCF_FORCE_CONFOLD: '1',
          // Disable color output
          CLICOLOR: '0',
          FORCE_COLOR: '0',
          NO_COLOR: '1'
        }
      });

      let stdout = '';
      let stderr = '';
      let responseCount = 0;
      let lastActivity = Date.now();

      // Handle stdout
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
        lastActivity = Date.now();
        
        // Auto-respond to prompts
        if (this.containsPrompt(output)) {
          console.log('🤖 Auto-responding to prompt...');
          this.sendResponse(child);
          responseCount++;
        }
      });

      // Handle stderr
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
        lastActivity = Date.now();
        
        // Auto-respond to prompts
        if (this.containsPrompt(output)) {
          console.log('🤖 Auto-responding to prompt...');
          this.sendResponse(child);
          responseCount++;
        }
      });

      // Handle process completion
      child.on('close', (code) => {
        console.log(`✅ Command completed with code ${code} (${responseCount} responses sent)`);
        resolve({ stdout, stderr, code, responseCount });
      });

      // Handle process errors
      child.on('error', (error) => {
        console.error(`❌ Command failed: ${error.message}`);
        reject(error);
      });

      // Auto-respond at regular intervals to ensure continuation
      const autoRespondInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        
        // If no activity for 1 second, send auto-response
        if (timeSinceLastActivity > 1000) {
          console.log('🤖 Sending auto-response to ensure continuation...');
          this.sendResponse(child);
          responseCount++;
          lastActivity = Date.now();
        }
      }, 500); // Check every 500ms

      // Stop auto-responding after 30 seconds
      setTimeout(() => {
        clearInterval(autoRespondInterval);
        console.log('⏰ Auto-response interval stopped');
      }, 30000);

      // Force continuation after command completion
      setTimeout(() => {
        console.log('🤖 Sending final auto-response to force continuation...');
        this.sendResponse(child);
        responseCount++;
      }, 3000);
    });
  }

  containsPrompt(output) {
    return this.prompts.some(prompt => 
      output.toLowerCase().includes(prompt.toLowerCase())
    );
  }

  sendResponse(child) {
    try {
      child.stdin.write('\n');
    } catch (e) {
      // Ignore EPIPE errors
    }
  }

  async testMultipleCommands(commands) {
    console.log('\n🎯 Testing Multiple Commands');
    console.log('============================');
    
    for (const command of commands) {
      try {
        const result = await this.testCommand(command);
        console.log(`✅ Success: ${command} (${result.responseCount} responses)`);
        
        // Small delay between commands
        await this.wait(1000);
      } catch (error) {
        console.error(`❌ Failed: ${command} - ${error.message}`);
      }
    }
    
    console.log('\n🎉 All commands tested without manual intervention!');
  }
}

// CLI usage
if (require.main === module) {
  const tester = new TestAnyCommand();
  
  const command = process.argv[2];
  
  if (command) {
    // Test single command
    tester.testCommand(command);
  } else {
    // Test multiple common commands
    const testCommands = [
      'git status',
      'npm list --depth=0',
      'python --version',
      'node --version',
      'npm --version',
      'git --version',
      'dir',
      'echo "Test completed successfully"'
    ];
    
    tester.testMultipleCommands(testCommands);
  }
}

module.exports = TestAnyCommand; 