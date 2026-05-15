import { io as Client } from 'socket.io-client';

async function testRealtimeEmit() {
  const BASE_URL = 'http://localhost:5000/api';
  const SOCKET_URL = 'http://localhost:5000';

  try {
    console.log('--- SETUP: Login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh.admin@sharma.com',
        password: 'Password123'
      })
    });
    const loginData: any = await loginRes.json();
    const token = loginData.data.accessToken;

    console.log('--- SOCKET: Connecting ---');
    const socket = Client(SOCKET_URL, { auth: { token } });

    let eventReceived = false;

    socket.on('dashboard:update', (data) => {
      console.log('\nSUCCESS! Realtime Dashboard Update Received:', JSON.stringify(data, null, 2));
      eventReceived = true;
    });

    socket.on('notification:new', (data) => {
      console.log('\nRealtime Notification Received:', JSON.stringify(data, null, 2));
    });

    await new Promise<void>(resolve => {
      socket.on('connect', () => resolve());
    });
    console.log('Socket connected.');

    const productId = 'cmp4zc02f00032lnffljcnqft';

    console.log('\n--- REST: Creating Invoice ---');
    const invoiceRes = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ productId, quantity: 1 }],
        tax: 5,
        discount: 0,
        paymentMethod: 'UPI'
      })
    });
    const invoiceData: any = await invoiceRes.json();
    console.log('Invoice created via REST. ID:', invoiceData.data.id);

    // Wait for event
    setTimeout(() => {
      if (!eventReceived) {
        console.error('\nFAILED: Realtime event not received within 5 seconds');
        process.exit(1);
      } else {
        console.log('\nRealtime test passed!');
        socket.close();
        process.exit(0);
      }
    }, 5000);

  } catch (error: any) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testRealtimeEmit();
