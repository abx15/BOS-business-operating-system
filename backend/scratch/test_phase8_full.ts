import { io as Client } from 'socket.io-client';

async function runPhase8Tests() {
  const BASE_URL = 'http://localhost:5000/api';
  const SOCKET_URL = 'http://localhost:5000';
  let companyAdminToken = '';
  let superAdminToken = '';
  let productId = 'cmp4zc02f00032lnffljcnqft'; // From previous step

  try {
    console.log('--- STEP 1: Login Company Admin ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh.admin@sharma.com',
        password: 'Password123'
      })
    });
    const loginData: any = await loginRes.json();
    companyAdminToken = loginData.data.accessToken;
    console.log('Company Admin Login successful');

    console.log('\n--- STEP 2 & 3: Connect Socket.io (Company Admin) ---');
    const companySocket = Client(SOCKET_URL, { auth: { token: companyAdminToken } });

    await new Promise<void>((resolve, reject) => {
      companySocket.on('connect', () => {
        console.log('Company Admin Connected! ID:', companySocket.id);
      });
      companySocket.on('connected', (data) => {
        console.log('STEP 4: Connection event received:', data);
        resolve();
      });
      companySocket.on('connect_error', (err) => reject(new Error(`Connection failed: ${err.message}`)));
      setTimeout(() => reject(new Error('Timeout connecting')), 5000);
    });

    console.log('\n--- STEP 6: Trigger Dashboard Update ---');
    let dashboardUpdateReceived = false;
    companySocket.on('dashboard:update', (data) => {
      console.log('STEP 6 SUCCESS: dashboard:update received:', data.type);
      dashboardUpdateReceived = true;
    });

    const invoiceRes = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${companyAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ productId, quantity: 1 }],
        tax: 5,
        discount: 0,
        paymentMethod: 'CASH'
      })
    });
    console.log('Invoice created.');

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!dashboardUpdateReceived) console.error('STEP 6 FAILED: dashboard:update not received');

    console.log('\n--- STEP 7: Trigger Notification (Low Stock) ---');
    let notificationReceived = false;
    companySocket.on('notification:new', (data) => {
      console.log('STEP 7 SUCCESS: notification:new received:', data.type);
      notificationReceived = true;
    });

    await fetch(`${BASE_URL}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${companyAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: 0, type: 'SET' })
    });
    console.log('Stock set to 0.');

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!notificationReceived) console.error('STEP 7 FAILED: notification:new not received');

    console.log('\n--- STEP 8: Tenant Isolation Test (Super Admin) ---');
    const saLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bos.com',
        password: 'SuperAdmin@123'
      })
    });
    const saLoginData: any = await saLoginRes.json();
    superAdminToken = saLoginData.data.accessToken;
    console.log('Super Admin Login successful');

    const superAdminSocket = Client(SOCKET_URL, { auth: { token: superAdminToken } });
    let saReceivedDashboardUpdate = false;
    superAdminSocket.on('dashboard:update', () => {
      saReceivedDashboardUpdate = true;
    });

    await new Promise<void>((resolve) => {
      superAdminSocket.on('connect', () => {
        console.log('Super Admin connected.');
        resolve();
      });
    });

    console.log('Triggering another invoice as Company Admin...');
    await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${companyAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ productId, quantity: 1 }],
        tax: 5,
        discount: 0,
        paymentMethod: 'CASH'
      })
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (saReceivedDashboardUpdate) {
      console.error('STEP 8 FAILED: Super Admin received Company Admin update (Leak!)');
    } else {
      console.log('STEP 8 SUCCESS: Tenant isolation working. Super Admin did not receive private event.');
    }

    console.log('\n--- STEP 9: Invalid Token Test ---');
    const invalidSocket = Client(SOCKET_URL, { auth: { token: 'invalid' } });
    await new Promise<void>((resolve) => {
      invalidSocket.on('connect_error', (err) => {
        console.log('STEP 9 SUCCESS: Invalid token rejected with:', err.message);
        resolve();
      });
      setTimeout(() => {
        console.error('STEP 9 FAILED: Invalid token was not rejected');
        resolve();
      }, 3000);
    });

    console.log('\nALL PHASE 8 TESTS COMPLETED');
    companySocket.close();
    superAdminSocket.close();
    invalidSocket.close();
    process.exit(0);

  } catch (error: any) {
    console.error('Phase 8 Test failed:', error.message);
    process.exit(1);
  }
}

runPhase8Tests();
