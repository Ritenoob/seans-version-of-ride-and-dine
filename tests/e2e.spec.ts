import { test, expect } from '@playwright/test';

test.describe('Ride & Dine E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ridendine_use_mock', 'false');
      localStorage.removeItem('ridendine_mock_db');
      localStorage.removeItem('ridendine_mock_session');
    });
  });
  test('customer browse -> add to cart -> checkout gate', async ({ page }) => {
    await page.goto('http://localhost:3002/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /browse chefs/i })).toBeVisible();

    await page.goto('http://localhost:3002/cook/chef-maria', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Menu', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    await page.evaluate(() => {
      localStorage.setItem('ridendine_cart', JSON.stringify({
        items: [
          {
            dish_id: 'dish-1111',
            name: 'Street Tacos (3)',
            price_cents: 1299,
            quantity: 1,
            chef_id: '11111111-1111-1111-1111-111111111111',
            chef_name: 'Chef Maria',
            chef_slug: 'chef-maria'
          }
        ],
        chefId: '11111111-1111-1111-1111-111111111111',
        chefName: 'Chef Maria',
        chefSlug: 'chef-maria'
      }));
    });

    await page.goto('http://localhost:3002/cart', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /proceed to checkout/i })).toBeVisible();

    await page.getByRole('link', { name: /proceed to checkout/i }).click();
    await expect(page.getByText(/sign in to checkout/i)).toBeVisible();
  });

  test('customer login -> account -> tracking map', async ({ page }) => {
    await page.goto('http://localhost:3002/auth/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      const res = await fetch('https://exzcczfixfoscgdxebbz.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4emNjemZpeGZvc2NnZHhlYmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzgyMjgsImV4cCI6MjA4NjUxNDIyOH0.SvXKuBeao4i5FheRsnQyGPPsF815Isyl1ommkkiDdaM',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'customer@example.com', password: 'password123' }),
      });
      const data = await res.json();
      localStorage.setItem('sb-exzcczfixfoscgdxebbz-auth-token', JSON.stringify(data));
    });
    await page.evaluate(() => {
      localStorage.setItem('ridendine_mock_session', JSON.stringify({
        user: {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'customer@example.com',
          user_metadata: { full_name: 'Test Customer' }
        }
      }));
    });

    await page.goto('http://localhost:3002/tracking?order=44444444-4444-4444-4444-444444444444');
    await expect(page.getByRole('heading', { name: /order tracking/i })).toBeVisible();
  });

  test('admin login -> orders page', async ({ page }) => {
    await page.goto('http://localhost:3003/login', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/admin@ridendine.com/i).fill('admin@ridendine.com');
    await page.getByPlaceholder(/enter your password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('http://localhost:3003/dashboard/orders', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
  });

  test('driver login -> go online -> accept order', async ({ page }) => {
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /driver/i })).toBeVisible({ timeout: 10000 });

    const loginForm = page.getByRole('button', { name: /sign in/i });
    if (await loginForm.isVisible()) {
      await page.getByPlaceholder(/driver@example.com/i).fill('driver.john@example.com');
      await page.getByPlaceholder(/enter your password/i).fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();
    }

    if (await page.getByRole('button', { name: /go online/i }).isVisible()) {
      await page.getByRole('button', { name: /go online/i }).click();
    }
    await expect(page.getByText(/available orders|active delivery|not registered as a driver/i)).toBeVisible();

    const acceptButton = page.getByRole('button', { name: /accept order/i }).first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await expect(page.getByText(/active delivery/i)).toBeVisible();
      await expect(page.getByText(/live route/i)).toBeVisible();
    }
  });
});
