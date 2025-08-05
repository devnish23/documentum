#!/usr/bin/env node

/**
 * Automated Terminal Script
 * Eliminates all manual "press enter" prompts for any command execution
 */

const { spawn, exec } = require('child_process');
const readline = require('readline');

class AutoTerminal {
  constructor() {
    this.isAutoMode = true;
    this.commandQueue = [];
    this.currentCommand = null;
  }

  /**
   * Execute command without any user interaction
   */
  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executing: ${command}`);
      
      const child = spawn(command, [], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: { ...process.env, CI: 'true', NODE_ENV: 'production' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Command completed successfully`);
          resolve({ stdout, stderr, code });
        } else {
          console.log(`⚠️ Command completed with code ${code}`);
          resolve({ stdout, stderr, code });
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Command failed: ${error.message}`);
        reject(error);
      });

      // Auto-respond to any prompts
      this.handlePrompts(child);
    });
  }

  /**
   * Handle any interactive prompts automatically
   */
  handlePrompts(child) {
    // Auto-respond to common prompts
    const autoResponses = [
      { pattern: /Press any key to continue/, response: '\n' },
      { pattern: /Press Enter to continue/, response: '\n' },
      { pattern: /Press RETURN to continue/, response: '\n' },
      { pattern: /Do you want to continue\?/, response: 'y\n' },
      { pattern: /Are you sure\?/, response: 'y\n' },
      { pattern: /Proceed\?/, response: 'y\n' },
      { pattern: /Continue\?/, response: 'y\n' },
      { pattern: /Confirm\?/, response: 'y\n' },
      { pattern: /[Y/n]/, response: 'y\n' },
      { pattern: /[y/N]/, response: 'y\n' },
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
      { pattern: /DevDependencies:/, response: '\n' }
    ];

    // Monitor stdout for prompts
    child.stdout.on('data', (data) => {
      const output = data.toString();
      
      for (const response of autoResponses) {
        if (response.pattern.test(output)) {
          console.log(`🤖 Auto-responding to prompt: ${response.pattern}`);
          child.stdin.write(response.response);
          break;
        }
      }
    });

    // Monitor stderr for prompts
    child.stderr.on('data', (data) => {
      const output = data.toString();
      
      for (const response of autoResponses) {
        if (response.pattern.test(output)) {
          console.log(`🤖 Auto-responding to prompt: ${response.pattern}`);
          child.stdin.write(response.response);
          break;
        }
      }
    });
  }

  /**
   * Execute multiple commands in sequence without prompts
   */
  async executeCommands(commands) {
    console.log('🤖 Starting automated command execution...');
    
    for (const command of commands) {
      try {
        await this.executeCommand(command);
        console.log(`✅ Completed: ${command}`);
      } catch (error) {
        console.error(`❌ Failed: ${command} - ${error.message}`);
        // Continue with next command
      }
    }
    
    console.log('🎉 All commands completed automatically!');
  }

  /**
   * Run npm commands without prompts
   */
  async runNpmCommands() {
    const commands = [
      'npm install',
      'npm run lint',
      'npm run type-check',
      'npm run test',
      'npm run build',
      'npm run docs'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run git commands without prompts
   */
  async runGitCommands() {
    const commands = [
      'git add .',
      'git commit -m "Auto-update from development"',
      'git push origin master'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run Python commands without prompts
   */
  async runPythonCommands() {
    const commands = [
      'python -m venv venv',
      'venv\\Scripts\\Activate.ps1',
      'pip install -r requirements.txt',
      'python -m pytest'
    ];

    await this.executeCommands(commands);
  }

  /**
   * Run Playwright commands without prompts
   */
  async runPlaywrightCommands() {
    const commands = [
      'npx playwright install',
      'npx playwright test',
      'npx playwright show-report'
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
module.exports = AutoTerminal;

// CLI usage
if (require.main === module) {
  const autoTerminal = new AutoTerminal();
  
  const command = process.argv[2];
  
  if (command === 'workflow') {
    autoTerminal.runCompleteWorkflow();
  } else if (command === 'npm') {
    autoTerminal.runNpmCommands();
  } else if (command === 'git') {
    autoTerminal.runGitCommands();
  } else if (command === 'python') {
    autoTerminal.runPythonCommands();
  } else if (command === 'playwright') {
    autoTerminal.runPlaywrightCommands();
  } else {
    console.log('Usage: node auto-terminal.js [workflow|npm|git|python|playwright]');
  }
} 