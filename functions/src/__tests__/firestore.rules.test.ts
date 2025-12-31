/**
 * Firestore Security Rules Tests
 *
 * Run with: npm test
 * Requires Firebase Emulator: firebase emulators:start --only firestore
 *
 * These tests verify that Firestore security rules are correctly configured
 * to protect payment and subscription data.
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'termivoxed-test';
const USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

beforeAll(async () => {
  // Read the security rules
  const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('User Profile Security', () => {
  test('user can read their own profile', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // First create the user document (as admin)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', USER_ID), {
        email: 'test@example.com',
        plan: 'free',
      });
    });

    // User should be able to read their own profile
    await assertSucceeds(getDoc(doc(db, 'users', USER_ID)));
  });

  test('user cannot read other user profiles', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create another user's document
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', OTHER_USER_ID), {
        email: 'other@example.com',
        plan: 'pro',
      });
    });

    // User should NOT be able to read other user's profile
    await assertFails(getDoc(doc(db, 'users', OTHER_USER_ID)));
  });

  test('user cannot modify subscription fields', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create user document
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', USER_ID), {
        email: 'test@example.com',
        plan: 'free',
        planStatus: 'none',
      });
    });

    // User should NOT be able to update subscription fields
    await assertFails(updateDoc(doc(db, 'users', USER_ID), {
      plan: 'enterprise',
      planStatus: 'active',
    }));
  });

  test('user can update allowed fields', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create user document
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', USER_ID), {
        email: 'test@example.com',
        displayName: 'Test User',
        plan: 'free',
      });
    });

    // User should be able to update displayName
    await assertSucceeds(updateDoc(doc(db, 'users', USER_ID), {
      displayName: 'Updated Name',
    }));
  });
});

describe('Payment Records Security', () => {
  test('user can read their own payments', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create payment record
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', USER_ID, 'payments', 'payment-1'), {
        invoiceNumber: 'TV-123',
        amountRupees: 199,
        status: 'paid',
      });
    });

    // User should be able to read their own payments
    await assertSucceeds(getDoc(doc(db, 'users', USER_ID, 'payments', 'payment-1')));
  });

  test('user cannot write to payments', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // User should NOT be able to create payment records
    await assertFails(addDoc(collection(db, 'users', USER_ID, 'payments'), {
      invoiceNumber: 'FAKE-123',
      amountRupees: 0,
      status: 'fake',
    }));
  });

  test('user cannot read other user payments', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create other user's payment
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', OTHER_USER_ID, 'payments', 'payment-1'), {
        invoiceNumber: 'TV-456',
        amountRupees: 399,
      });
    });

    // User should NOT be able to read other user's payments
    await assertFails(getDoc(doc(db, 'users', OTHER_USER_ID, 'payments', 'payment-1')));
  });
});

describe('Orders Collection Security', () => {
  test('user can read their own orders', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create order
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'orders', 'order-123'), {
        uid: USER_ID,
        planId: 'individual',
        status: 'paid',
      });
    });

    // User should be able to read their own order
    await assertSucceeds(getDoc(doc(db, 'orders', 'order-123')));
  });

  test('user cannot write to orders', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // User should NOT be able to create orders
    await assertFails(setDoc(doc(db, 'orders', 'fake-order'), {
      uid: USER_ID,
      planId: 'enterprise',
      status: 'paid',
    }));
  });

  test('user cannot read other user orders', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create other user's order
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'orders', 'other-order'), {
        uid: OTHER_USER_ID,
        planId: 'pro',
        status: 'paid',
      });
    });

    // User should NOT be able to read other user's order
    await assertFails(getDoc(doc(db, 'orders', 'other-order')));
  });
});

describe('Rate Limits Collection Security', () => {
  test('user cannot read rate limits', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // Create rate limit record
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'rate_limits', `${USER_ID}_createOrder`), {
        count: 5,
        firstRequestAt: Date.now(),
      });
    });

    // User should NOT be able to read rate limits
    await assertFails(getDoc(doc(db, 'rate_limits', `${USER_ID}_createOrder`)));
  });

  test('user cannot write to rate limits', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();

    // User should NOT be able to create/modify rate limits
    await assertFails(setDoc(doc(db, 'rate_limits', `${USER_ID}_createOrder`), {
      count: 0,
      firstRequestAt: Date.now(),
    }));
  });
});

describe('Unauthenticated Access', () => {
  test('unauthenticated user cannot read user profiles', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', USER_ID), {
        email: 'test@example.com',
      });
    });

    await assertFails(getDoc(doc(db, 'users', USER_ID)));
  });

  test('unauthenticated user can read public config', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'config', 'app'), {
        version: '1.0.0',
      });
    });

    // Config collection should be publicly readable
    await assertSucceeds(getDoc(doc(db, 'config', 'app')));
  });

  test('unauthenticated user can read plans', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'plans', 'individual'), {
        name: 'Individual',
        price: 199,
      });
    });

    // Plans collection should be publicly readable
    await assertSucceeds(getDoc(doc(db, 'plans', 'individual')));
  });
});
