import assert from 'node:assert/strict';

interface DirtyPayloadCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update';
  authUid: string | null;
  emailVerified: boolean;
  payload: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyPayloadCase[] = [
  {
    id: 1,
    name: 'Unverified Email Write',
    collection: 'users/u1',
    operation: 'create',
    authUid: 'u1',
    emailVerified: false,
    payload: { uid: 'u1', name: 'Test', role: 'student' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Role Escalation (Student -> Owner)',
    collection: 'users/u1',
    operation: 'update',
    authUid: 'u1',
    emailVerified: true,
    payload: { role: 'owner' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Gender Mutation After Login',
    collection: 'users/u1',
    operation: 'update',
    authUid: 'u1',
    emailVerified: true,
    payload: { gender: 'Female' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Private PII Read',
    collection: 'users/u1/private/info',
    operation: 'get',
    authUid: 'u2',
    emailVerified: true,
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow / Ghost Field Injection',
    collection: 'bazaarItems/b1',
    operation: 'create',
    authUid: 'u1',
    emailVerified: true,
    payload: { id: 'b1', sellerUid: 'u1', isFeatured: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning (Invalid Characters)',
    collection: 'notifications/bad$id/extra',
    operation: 'create',
    authUid: 'u1',
    emailVerified: true,
    payload: { id: 'bad$id', recipientUid: 'u1', senderUid: 'u1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Client Timestamp Forgery',
    collection: 'bookings/bk1',
    operation: 'create',
    authUid: 'u1',
    emailVerified: true,
    payload: { id: 'bk1', studentUid: 'u1', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'State Shortcutting (Booking Created Approved)',
    collection: 'bookings/bk2',
    operation: 'create',
    authUid: 'u1',
    emailVerified: true,
    payload: { id: 'bk2', studentUid: 'u1', status: 'Approved' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Terminal State Re-open',
    collection: 'bookings/bk1',
    operation: 'update',
    authUid: 'owner1',
    emailVerified: true,
    payload: { status: 'Pending' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Blanket Notification List Scraping',
    collection: 'notifications',
    operation: 'list',
    authUid: 'u2',
    emailVerified: true,
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Chat Sender Identity Spoofing',
    collection: 'chatMessages/m1',
    operation: 'create',
    authUid: 'u2',
    emailVerified: true,
    payload: { id: 'm1', senderUid: 'u1', text: 'spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Oversized Title / Unbounded Array Exhaustion',
    collection: 'pgListings/pg1',
    operation: 'create',
    authUid: 'owner1',
    emailVerified: true,
    payload: {
      id: 'pg1',
      ownerUid: 'owner1',
      title: 'X'.repeat(500),
      photos: new Array(25).fill('/images/pg-single-ac.jpg'),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];

export function verifyDirtyDozenSpecs(): void {
  assert.equal(DIRTY_DOZEN_CASES.length, 12);
  for (const testCase of DIRTY_DOZEN_CASES) {
    assert.equal(testCase.expectedResult, 'PERMISSION_DENIED');
  }
}
