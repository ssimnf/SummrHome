# SummrHome Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity & Immutability**: A user's `/users/{userId}` document can only be created when `uid == request.auth.uid` and `email_verified == true`. Once created, `role` (`student` | `owner` | `guardian`) and `gender` (`Male` | `Female` for students) cannot be altered on update.
2. **PII Isolation**: Personal email, mobile number, and guardian contact details reside exclusively under `/users/{userId}/private/info` and are readable/writable only when `request.auth.uid == userId`.
3. **Booking Scope & Terminal State**: Bookings can only be created by the authenticated student (`studentUid == request.auth.uid`) in `Pending` status. Only the PG owner (`ownerUid == request.auth.uid`) can transition a `Pending` booking to `Approved` or `Declined`. Once `Approved` or `Declined`, the status is terminal and cannot be modified.
4. **Notification Privacy**: Notifications in `/notifications/{notificationId}` are readable, listable, updatable (only `read` and `updatedAt`), and deletable strictly by `recipientUid == request.auth.uid`.
5. **Bazaar Seller Privacy**: `bazaarItems` only store `contactNumber` when `showPhone == true`; otherwise `contactNumber == ""`. Only the original `sellerUid` can toggle `status` (`Available` <-> `Sold`) or edit the item.
6. **Temporal & Structural Integrity**: Every `create` requires `createdAt == request.time` and `updatedAt == request.time`. Every `update` preserves `createdAt == existing().createdAt` and requires `updatedAt == request.time`. All document IDs match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars) and all strings/arrays have strict bounds.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Write**: Attempt to create `/users/u1` with `request.auth.token.email_verified = false`. Expected: `PERMISSION_DENIED`.
2. **Role Escalation**: Student attempts `update` on `/users/u1` changing `role` from `"student"` to `"owner"`. Expected: `PERMISSION_DENIED`.
3. **Gender Mutation**: Student attempts `update` on `/users/u1` changing `gender` from `"Male"` to `"Female"`. Expected: `PERMISSION_DENIED`.
4. **PII Cross-Read**: User `u2` attempts `get` on `/users/u1/private/info`. Expected: `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: User `u1` attempts `create` on `/bazaarItems/item1` with an extra undeclared field `isFeatured: true`. Expected: `PERMISSION_DENIED`.
6. **ID Poisoning**: Attempt `create` on `/notifications/bad$id..1500chars` violating `isValidId()`. Expected: `PERMISSION_DENIED`.
7. **Timestamp Forgery**: Attempt `create` on `/bookings/bk1` with client-supplied `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`. Expected: `PERMISSION_DENIED`.
8. **State Shortcutting**: Student attempts `create` on `/bookings/bk2` directly with `status: "Approved"`. Expected: `PERMISSION_DENIED`.
9. **Terminal State Re-open**: Owner attempts `update` on `/bookings/bk1` changing `status` from `"Approved"` back to `"Pending"`. Expected: `PERMISSION_DENIED`.
10. **Blanket List / Query Scraping**: User `u2` runs `list` on `/notifications` without `where('recipientUid', '==', 'u2')`. Expected: `PERMISSION_DENIED`.
11. **Identity Spoofing**: User `u2` attempts `create` on `/chatMessages/m1` with `senderUid: "u1"`. Expected: `PERMISSION_DENIED`.
12. **Unbounded Array / Resource Exhaustion**: User attempts `create` on `/pgListings/pg1` with 25 elements in `photos` or a 50KB `title`. Expected: `PERMISSION_DENIED`.
