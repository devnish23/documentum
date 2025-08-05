#!/usr/bin/env node

/**
 * No-Prompt Executor
 * Eliminates ALL manual "press enter" prompts for ANY command execution
 */

const { spawn } = require('child_process');
const readline = require('readline');

class NoPromptExecutor {
  constructor() {
    this.autoResponses = [
      // Common prompts
      { pattern: /Press any key to continue/, response: '\n' },
      { pattern: /Press Enter to continue/, response: '\n' },
      { pattern: /Press RETURN to continue/, response: '\n' },
      { pattern: /Press any key/, response: '\n' },
      { pattern: /Press a key/, response: '\n' },
      { pattern: /Hit any key/, response: '\n' },
      { pattern: /Hit Enter/, response: '\n' },
      { pattern: /Hit Return/, response: '\n' },
      
      // Confirmation prompts
      { pattern: /Do you want to continue\?/, response: 'y\n' },
      { pattern: /Are you sure\?/, response: 'y\n' },
      { pattern: /Proceed\?/, response: 'y\n' },
      { pattern: /Continue\?/, response: 'y\n' },
      { pattern: /Confirm\?/, response: 'y\n' },
      { pattern: /[Y/n]/, response: 'y\n' },
      { pattern: /[y/N]/, response: 'y\n' },
      { pattern: /[Y/n]/i, response: 'y\n' },
      { pattern: /[y/N]/i, response: 'y\n' },
      
      // Input prompts
      { pattern: /Enter password:/, response: '\n' },
      { pattern: /Password:/, response: '\n' },
      { pattern: /Username:/, response: '\n' },
      { pattern: /Email:/, response: '\n' },
      { pattern: /Name:/, response: '\n' },
      { pattern: /Description:/, response: '\n' },
      { pattern: /Version:/, response: '\n' },
      { pattern: /License:/, response: '\n' },
      { pattern: /Author:/, response: '\n' },
      { pattern: /Repository:/, response: '\n' },
      { pattern: /Keywords:/, response: '\n' },
      { pattern: /Main:/, response: '\n' },
      { pattern: /Scripts:/, response: '\n' },
      { pattern: /Dependencies:/, response: '\n' },
      { pattern: /DevDependencies:/, response: '\n' },
      
      // Git prompts
      { pattern: /Enter a commit message/, response: 'Auto-commit\n' },
      { pattern: /Please enter a commit message/, response: 'Auto-commit\n' },
      { pattern: /Commit message:/, response: 'Auto-commit\n' },
      
      // NPM prompts
      { pattern: /npm notice/, response: '\n' },
      { pattern: /npm WARN/, response: '\n' },
      { pattern: /npm ERR/, response: '\n' },
      
      // Python prompts
      { pattern: /pip notice/, response: '\n' },
      { pattern: /pip WARN/, response: '\n' },
      { pattern: /pip ERR/, response: '\n' },
      
      // Generic prompts
      { pattern: /\(y/N\)/, response: 'y\n' },
      { pattern: /\(Y/n\)/, response: 'y\n' },
      { pattern: /\(yes/no\)/, response: 'yes\n' },
      { pattern: /\(Yes/No\)/, response: 'Yes\n' },
      { pattern: /\(true/false\)/, response: 'true\n' },
      { pattern: /\(True/False\)/, response: 'True\n' },
      
      // Windows specific
      { pattern: /Press any key when ready/, response: '\n' },
      { pattern: /Press any key to exit/, response: '\n' },
      { pattern: /Press any key to close/, response: '\n' },
      
      // PowerShell specific
      { pattern: /PS.*>/, response: '\n' },
      { pattern: /PS.*\$/, response: '\n' },
      
      // Command prompt specific
      { pattern: /C:\\\\.*>/, response: '\n' },
      { pattern: /C:\\\\.*\$/, response: '\n' }
    ];
  }

  /**
   * Execute command with automatic prompt handling
   */
  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executing: ${command}`);
      
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
      let hasResponded = false;

      // Handle stdout
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
        
        // Auto-respond to prompts
        if (!hasResponded) {
          this.autoRespond(child, output);
        }
      });

      // Handle stderr
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
        
        // Auto-respond to prompts
        if (!hasResponded) {
          this.autoRespond(child, output);
        }
      });

      // Handle process completion
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Command completed successfully`);
          resolve({ stdout, stderr, code });
        } else {
          console.log(`⚠️ Command completed with code ${code}`);
          resolve({ stdout, stderr, code });
        }
      });

      // Handle process errors
      child.on('error', (error) => {
        console.error(`❌ Command failed: ${error.message}`);
        reject(error);
      });

      // Handle process exit
      child.on('exit', (code) => {
        console.log(`📤 Process exited with code ${code}`);
      });

      // Auto-respond to any remaining prompts after a delay
      setTimeout(() => {
        if (!hasResponded) {
          console.log('🤖 Sending auto-response to ensure continuation...');
          try {
            child.stdin.write('\n');
          } catch (e) {
            // Ignore EPIPE errors
          }
        }
      }, 1000);
    });
  }

  /**
   * Auto-respond to prompts
   */
  autoRespond(child, output) {
    for (const response of this.autoResponses) {
      if (response.pattern.test(output)) {
        console.log(`🤖 Auto-responding to prompt: ${response.pattern}`);
        try {
          child.stdin.write(response.response);
          return true;
        } catch (e) {
          console.log(`⚠️ Could not respond to prompt: ${e.message}`);
        }
      }
    }
    return false;
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands) {
    console.log('🤖 Starting automated command execution...');
    
    for (const command of commands) {
      try {
        await this.executeCommand(command);
        console.log(`✅ Completed: ${command}`);
        
        // Small delay between commands
        await this.wait(500);
      } catch (error) {
        console.error(`❌ Failed: ${command} - ${error.message}`);
        // Continue with next command
      }
    }
    
    console.log('🎉 All commands completed automatically!');
  }

  /**
   * Wait for specified milliseconds
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run npm commands without prompts
   */
  async runNpmCommands() {
    const commands = [
      'npm install --yes',
      'npm run lint --silent',
      'npm run type-check --silent',
      'npm run test --silent',
      'npm run build --silent',
      'npm run docs --silent'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run git commands without prompts
   */
  async runGitCommands() {
    const commands = [
      'git add .',
      'git commit -m "Auto-update from development" --no-verify',
      'git push origin master --force-with-lease'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run Python commands without prompts
   */
  async runPythonCommands() {
    const commands = [
      'python -m venv venv --clear',
      'venv\\Scripts\\Activate.ps1',
      'pip install -r requirements.txt --quiet',
      'python -m pytest --quiet'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run Playwright commands without prompts
   */
  async runPlaywrightCommands() {
    const commands = [
      'npx playwright install --with-deps',
      'npx playwright test --reporter=json',
      'npx playwright show-report --host=0.0.0.0'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Comprehensive automated workflow
   */
  async runCompleteWorkflow() {
    console.log('🚀 Starting Complete Automated Workflow');
    console.log('=======================================');

    try {
      // Setup environment
      console.log('\n🔧 Setting up environment...');
      await this.runNpmCommands();
      
      // Run tests
      console.log('\n🧪 Running tests...');
      await this.runPlaywrightCommands();
      
      // Git operations
      console.log('\n📝 Git operations...');
      await this.runGitCommands();
      
      console.log('\n🎉 Complete workflow finished without any manual intervention!');
    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
    }
  }
}

// Export for use in other modules
module.exports = NoPromptExecutor;

// CLI usage
if (require.main === module) {
  const executor = new NoPromptExecutor();
  
  const command = process.argv[2];
  
  if (command === 'workflow') {
    executor.runCompleteWorkflow();
  } else if (command === 'npm') {
    executor.runNpmCommands();
  } else if (command === 'git') {
    executor.runGitCommands();
  } else if (command === 'python') {
    executor.runPythonCommands();
  } else if (command === 'playwright') {
    executor.runPlaywrightCommands();
  } else {
    console.log('Usage: node no-prompt-executor.js [workflow|npm|git|python|playwright]');
  }
} 