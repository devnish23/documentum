#!/usr/bin/env node

/**
 * Automated Git Operations Script
 * Handles all git operations without user intervention
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoGit {
  constructor() {
    this.repository = 'https://github.com/devnish23/documentum.git';
    this.branch = 'main';
  }

  /**
   * Execute git command without user interaction
   */
  async executeGitCommand(command) {
    return new Promise((resolve, reject) => {
      console.log(`Executing: ${command}`);
      
      exec(command, { 
        cwd: process.cwd(),
        stdio: 'inherit'
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Git command failed: ${error.message}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.warn(`Git warning: ${stderr}`);
        }
        
        console.log(`Git command successful: ${stdout}`);
        resolve(stdout);
      });
    });
  }

  /**
   * Add all files to git
   */
  async addAll() {
    try {
      await this.executeGitCommand('git add .');
      console.log('✅ All files added to git');
      return true;
    } catch (error) {
      console.error('❌ Failed to add files:', error.message);
      return false;
    }
  }

  /**
   * Commit changes with automatic message
   */
  async commit(message) {
    try {
      await this.executeGitCommand(`git commit -m "${message}"`);
      console.log('✅ Changes committed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to commit:', error.message);
      return false;
    }
  }

  /**
   * Push to remote repository
   */
  async push() {
    try {
      await this.executeGitCommand(`git push origin ${this.branch}`);
      console.log('✅ Changes pushed to remote repository');
      return true;
    } catch (error) {
      console.error('❌ Failed to push:', error.message);
      return false;
    }
  }

  /**
   * Pull latest changes
   */
  async pull() {
    try {
      await this.executeGitCommand(`git pull origin ${this.branch}`);
      console.log('✅ Latest changes pulled');
      return true;
    } catch (error) {
      console.error('❌ Failed to pull:', error.message);
      return false;
    }
  }

  /**
   * Check git status
   */
  async status() {
    try {
      const status = await this.executeGitCommand('git status --porcelain');
      return status.trim();
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
      return '';
    }
  }

  /**
   * Check if there are changes to commit
   */
  async hasChanges() {
    const status = await this.status();
    return status.length > 0;
  }

  /**
   * Automated git workflow
   */
  async autoWorkflow(commitMessage = 'Auto-update from development') {
    console.log('🚀 Starting automated git workflow...');
    
    try {
      // Check if there are changes
      const hasChanges = await this.hasChanges();
      
      if (!hasChanges) {
        console.log('ℹ️ No changes to commit');
        return true;
      }

      // Add all files
      const added = await this.addAll();
      if (!added) {
        throw new Error('Failed to add files');
      }

      // Commit changes
      const committed = await this.commit(commitMessage);
      if (!committed) {
        throw new Error('Failed to commit changes');
      }

      // Push to remote
      const pushed = await this.push();
      if (!pushed) {
        throw new Error('Failed to push changes');
      }

      console.log('🎉 Automated git workflow completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Automated git workflow failed:', error.message);
      return false;
    }
  }

  /**
   * Setup git configuration for automated operations
   */
  async setupGitConfig() {
    try {
      // Set git to not ask for credentials
      await this.executeGitCommand('git config --global credential.helper store');
      
      // Set default push behavior
      await this.executeGitCommand('git config --global push.default current');
      
      // Set default branch
      await this.executeGitCommand('git config --global init.defaultBranch main');
      
      console.log('✅ Git configuration set for automated operations');
      return true;
    } catch (error) {
      console.error('❌ Failed to setup git config:', error.message);
      return false;
    }
  }

  /**
   * Create a git hook for automatic operations
   */
  async createGitHook() {
    const hookContent = `#!/bin/sh
# Auto-git hook for automated operations
echo "Automated git operation in progress..."
node scripts/auto-git.js
`;

    try {
      const hookPath = '.git/hooks/post-commit';
      fs.writeFileSync(hookPath, hookContent);
      
      // Make the hook executable
      await this.executeGitCommand(`chmod +x ${hookPath}`);
      
      console.log('✅ Git hook created for automated operations');
      return true;
    } catch (error) {
      console.error('❌ Failed to create git hook:', error.message);
      return false;
    }
  }
}

// Export for use in other modules
module.exports = AutoGit;

// CLI usage
if (require.main === module) {
  const autoGit = new AutoGit();
  
  // Get commit message from command line arguments
  const commitMessage = process.argv[2] || 'Auto-update from development';
  
  // Run automated workflow
  autoGit.autoWorkflow(commitMessage)
    .then(success => {
      if (success) {
        console.log('✅ Git operations completed automatically');
        process.exit(0);
      } else {
        console.error('❌ Git operations failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
} 