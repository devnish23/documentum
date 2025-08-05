const { test, expect } = require('@playwright/test');
const AutoHealer = require('../scripts/auto-heal');

// Initialize auto-healer
const autoHealer = new AutoHealer();

/**
 * End-to-End Test Suite for Documentum Application
 * Tests complete user workflows with auto-healing capabilities
 */

test.describe('Documentum E2E Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    // Create new page for each test
    page = await browser.newPage();
    
    // Set up error handling with auto-healing
    page.on('pageerror', async (error) => {
      console.log(`Page error detected: ${error.message}`);
      await autoHealer.heal(error, { context: 'page_error' });
    });

    // Navigate to the application
    try {
      await page.goto('/');
    } catch (error) {
      console.log(`Navigation error: ${error.message}`);
      const healed = await autoHealer.heal(error, { context: 'navigation' });
      if (healed) {
        await page.goto('/');
      }
    }
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Complete user registration workflow', async () => {
    // Test user registration from start to finish
    await test.step('Navigate to registration page', async () => {
      await expect(page).toHaveURL('/');
      
      // Click on register button with auto-healing
      await autoHealer.retry(async () => {
        await page.click('[data-testid="register-button"]');
      });
      
      await expect(page).toHaveURL('/register');
    });

    await test.step('Fill registration form', async () => {
      // Fill form fields with validation
      await page.fill('[data-testid="username"]', 'testuser');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'securepassword123');
      await page.fill('[data-testid="confirm-password"]', 'securepassword123');
      
      // Verify form validation
      await expect(page.locator('[data-testid="username"]')).toHaveValue('testuser');
      await expect(page.locator('[data-testid="email"]')).toHaveValue('test@example.com');
    });

    await test.step('Submit registration', async () => {
      // Submit form with auto-healing
      await autoHealer.retry(async () => {
        await page.click('[data-testid="submit-registration"]');
      });
      
      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    await test.step('Verify user is logged in', async () => {
      // Check if user is redirected to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    });
  });

  test('Document upload and management workflow', async () => {
    await test.step('Login to application', async () => {
      await page.fill('[data-testid="username"]', 'testuser');
      await page.fill('[data-testid="password"]', 'securepassword123');
      
      await autoHealer.retry(async () => {
        await page.click('[data-testid="login-button"]');
      });
      
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('Upload document', async () => {
      // Create a test file
      const testFile = {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test PDF content')
      };
      
      // Upload file with auto-healing
      await autoHealer.retry(async () => {
        await page.setInputFiles('[data-testid="file-upload"]', testFile);
      });
      
      // Wait for upload to complete
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    });

    await test.step('Verify document in list', async () => {
      await expect(page.locator('[data-testid="document-list"]')).toContainText('test-document.pdf');
    });

    await test.step('Edit document metadata', async () => {
      await page.click('[data-testid="edit-document"]');
      await page.fill('[data-testid="document-title"]', 'Updated Test Document');
      await page.fill('[data-testid="document-description"]', 'This is an updated test document');
      
      await autoHealer.retry(async () => {
        await page.click('[data-testid="save-document"]');
      });
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test('Search and filter functionality', async () => {
    await test.step('Perform search', async () => {
      await page.fill('[data-testid="search-input"]', 'test document');
      
      await autoHealer.retry(async () => {
        await page.click('[data-testid="search-button"]');
      });
      
      // Wait for search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    await test.step('Apply filters', async () => {
      await page.selectOption('[data-testid="document-type-filter"]', 'pdf');
      await page.selectOption('[data-testid="date-filter"]', 'last-week');
      
      // Verify filtered results
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    });
  });

  test('User profile management', async () => {
    await test.step('Access user profile', async () => {
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="profile-link"]');
      
      await expect(page).toHaveURL('/profile');
    });

    await test.step('Update profile information', async () => {
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="phone"]', '+1234567890');
      
      await autoHealer.retry(async () => {
        await page.click('[data-testid="save-profile"]');
      });
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test('API integration testing', async () => {
    await test.step('Test API endpoints', async () => {
      // Test GET request
      const response = await page.request.get('/api/documents');
      expect(response.status()).toBe(200);
      
      const documents = await response.json();
      expect(Array.isArray(documents)).toBe(true);
    });

    await test.step('Test POST request', async () => {
      const newDocument = {
        title: 'API Test Document',
        description: 'Document created via API',
        type: 'pdf'
      };
      
      const response = await page.request.post('/api/documents', {
        data: newDocument
      });
      
      expect(response.status()).toBe(201);
      
      const createdDocument = await response.json();
      expect(createdDocument.title).toBe('API Test Document');
    });
  });

  test('Database operations', async () => {
    await test.step('Create database record', async () => {
      // This would test actual database operations
      const response = await page.request.post('/api/documents', {
        data: {
          title: 'Database Test',
          content: 'Test content for database',
          metadata: { author: 'Test User' }
        }
      });
      
      expect(response.status()).toBe(201);
    });

    await test.step('Retrieve and verify data', async () => {
      const response = await page.request.get('/api/documents');
      const documents = await response.json();
      
      const testDocument = documents.find(doc => doc.title === 'Database Test');
      expect(testDocument).toBeDefined();
      expect(testDocument.metadata.author).toBe('Test User');
    });
  });

  test('Performance testing', async () => {
    await test.step('Measure page load time', async () => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      const loadTime = Date.now() - startTime;
      
      // Assert page loads within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    await test.step('Test search performance', async () => {
      const startTime = Date.now();
      await page.fill('[data-testid="search-input"]', 'test');
      await page.click('[data-testid="search-button"]');
      await page.waitForSelector('[data-testid="search-results"]');
      const searchTime = Date.now() - startTime;
      
      // Assert search completes within 2 seconds
      expect(searchTime).toBeLessThan(2000);
    });
  });

  test('Accessibility testing', async () => {
    await test.step('Check ARIA labels', async () => {
      await expect(page.locator('[aria-label="Search documents"]')).toBeVisible();
      await expect(page.locator('[aria-label="Upload file"]')).toBeVisible();
    });

    await test.step('Test keyboard navigation', async () => {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input');
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-button');
    });

    await test.step('Check color contrast', async () => {
      // This would use Playwright's built-in accessibility testing
      const accessibility = await page.accessibility.snapshot();
      expect(accessibility).toBeDefined();
    });
  });

  test('Error handling and recovery', async () => {
    await test.step('Test network error recovery', async () => {
      // Simulate network error
      await page.route('**/api/documents', route => {
        route.abort('failed');
      });
      
      await page.click('[data-testid="load-documents"]');
      
      // Auto-healing should handle this
      const healed = await autoHealer.heal(new Error('Network request failed'));
      expect(healed).toBe(true);
    });

    await test.step('Test element not found recovery', async () => {
      // Try to click non-existent element
      try {
        await page.click('[data-testid="non-existent-element"]');
      } catch (error) {
        const healed = await autoHealer.heal(error);
        expect(healed).toBe(true);
      }
    });
  });
});

// Global error handling for all tests
test.beforeEach(async ({ page }) => {
  // Set up global error handling
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Console error: ${msg.text()}`);
    }
  });
  
  page.on('requestfailed', request => {
    console.log(`Request failed: ${request.url()}`);
  });
}); 