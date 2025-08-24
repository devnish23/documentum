#!/usr/bin/env node

/**
 * Test Enhanced Auto-Continue Functionality
 * Verifies that the enhanced auto-continue eliminates terminal waiting issues
 */

const { spawn } = require('child_process');
const path = require('path');

class TestEnhancedAutoContinue {
  constructor() {
    this.testResults = [];
  }

  /**
   * Test the enhanced auto-continue script
   */
  async testEnhancedAutoContinue() {
    console.log('🧪 Testing Enhanced Auto-Continue Functionality...\n');
    
    const tests = [
      {
        name: 'Test npm install (should not wait for prompts)',
        command: 'node scripts/enhanced-auto-continue.js npm',
        expected: 'should complete without manual intervention'
      },
      {
        name: 'Test git commands (should not wait for prompts)',
        command: 'node scripts/enhanced-auto-continue.js git',
        expected: 'should complete without manual intervention'
      },
      {
        name: 'Test PowerShell enhanced script',
        command: 'powershell -ExecutionPolicy Bypass -File scripts/enhanced-auto-continue.ps1 -Mode npm',
        expected: 'should complete without manual intervention'
      },
      {
        name: 'Test single command execution',
        command: 'node scripts/enhanced-auto-continue.js "echo test && pause"',
        expected: 'should auto-continue past pause'
      }
    ];

    for (const test of tests) {
      console.log(`\n🔍 Running: ${test.name}`);
      console.log(`📝 Command: ${test.command}`);
      
      try {
        const result = await this.executeTest(test.command);
        this.testResults.push({
          test: test.name,
          status: 'PASS',
          output: result
        });
        console.log('✅ PASS');
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: 'FAIL',
          error: error.message
        });
        console.log('❌ FAIL');
      }
    }

    this.printResults();
  }

  /**
   * Execute a test command
   */
  async executeTest(command) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let output = '';
      let hasCompleted = false;

      const child = spawn(command, [], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!hasCompleted) {
          child.kill();
          reject(new Error('Test timed out after 60 seconds'));
        }
      }, 60000);

      child.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data.toString());
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
        process.stderr.write(data.toString());
      });

      child.on('close', (code) => {
        hasCompleted = true;
        clearTimeout(timeout);
        
        const duration = Date.now() - startTime;
        console.log(`\n⏱️  Completed in ${duration}ms with code: ${code}`);
        
        if (code === 0) {
          resolve({ code, output, duration });
        } else {
          reject(new Error(`Command failed with code: ${code}`));
        }
      });

      child.on('error', (error) => {
        hasCompleted = true;
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  /**
   * Test specific problematic scenarios
   */
  async testProblematicScenarios() {
    console.log('\n🔧 Testing Problematic Scenarios...\n');
    
    const scenarios = [
      {
        name: 'Command with pause',
        command: 'echo "Starting..." && pause && echo "After pause"',
        script: 'node scripts/enhanced-auto-continue.js'
      },
      {
        name: 'Command with confirmation prompt',
        command: 'echo "Do you want to continue? [Y/n]" && read -p "Press Enter"',
        script: 'node scripts/enhanced-auto-continue.js'
      },
      {
        name: 'PowerShell command with pause',
        command: 'Write-Host "Starting..." ; Read-Host "Press Enter" ; Write-Host "After pause"',
        script: 'powershell -ExecutionPolicy Bypass -File scripts/enhanced-auto-continue.ps1'
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n🔍 Testing: ${scenario.name}`);
      try {
        const result = await this.executeTest(`${scenario.script} "${scenario.command}"`);
        console.log('✅ Scenario passed - no manual intervention required');
      } catch (error) {
        console.log('❌ Scenario failed - manual intervention required');
      }
    }
  }
}

// Main execution
async function main() {
  const tester = new TestEnhancedAutoContinue();
  
  try {
    await tester.testEnhancedAutoContinue();
    await tester.testProblematicScenarios();
    
    console.log('\n🎉 Enhanced Auto-Continue Testing Complete!');
    console.log('\n💡 Usage Tips:');
    console.log('   • Use: node scripts/enhanced-auto-continue.js [mode]');
    console.log('   • Modes: npm, git, workflow, or custom command');
    console.log('   • PowerShell: .\\scripts\\enhanced-auto-continue.ps1 -Mode [mode]');
    console.log('   • For problematic commands, use sendkeys mode in PowerShell');
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestEnhancedAutoContinue;
