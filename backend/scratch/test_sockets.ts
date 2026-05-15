import { io as Client } from 'socket.io-client';

async function testSockets() {
  const BASE_URL = 'http://localhost:5000/api';
  const SOCKET_URL = 'http://localhost:5000';

  try {
    console.log('--- SETUP: Login to get token ---');
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
    console.log('Login successful');

    console.log('\n--- SOCKET: Connecting ---');
    const socket = Client(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket connected! ID:', socket.id);
    });

    socket.on('connected', (data) => {
      console.log('Connection event received:', data);
    });

    socket.on('dashboard:update', (data) => {
      console.log('Realtime Dashboard Update:', data);
    });

    socket.on('notification:new', (data) => {
      console.log('Realtime Notification:', data);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

    // Test dashboard refresh request
    setTimeout(() => {
      console.log('\n--- SOCKET: Emitting dashboard:refresh ---');
      socket.emit('dashboard:refresh');
    }, 2000);

    socket.on('dashboard:refresh-ack', (data) => {
      console.log('Dashboard Refresh Ack received:', data);
    });

    // Keep script alive for a bit to see events
    setTimeout(() => {
      console.log('\n--- SOCKET: Closing connection ---');
      socket.close();
      process.exit(0);
    }, 10000);

  } catch (error: any) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testSockets();
