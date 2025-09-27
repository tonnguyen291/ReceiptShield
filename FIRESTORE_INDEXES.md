# Firestore Indexes Documentation

## Overview
This document describes the Firestore indexes that have been created to optimize query performance for the ReceiptShield application.

## Deployed Indexes

### Receipts Collection
1. **Composite Index: supervisorId + isFraudulent + status + uploadedAt**
   - Fields: `supervisorId` (ASC), `isFraudulent` (ASC), `status` (ASC), `uploadedAt` (DESC)
   - Used for: Manager dashboard queries filtering by supervisor, fraud status, and receipt status

2. **Composite Index: supervisorId + uploadedAt**
   - Fields: `supervisorId` (ASC), `uploadedAt` (DESC)
   - Used for: Getting all receipts for a supervisor's team, ordered by upload date

3. **Composite Index: uploadedBy + uploadedAt**
   - Fields: `uploadedBy` (ASC), `uploadedAt` (DESC)
   - Used for: Employee dashboard showing their own receipts, ordered by upload date

4. **Composite Index: status + uploadedAt**
   - Fields: `status` (ASC), `uploadedAt` (DESC)
   - Used for: Admin queries filtering receipts by status (pending, approved, rejected, etc.)

### Users Collection
1. **Composite Index: role + status**
   - Fields: `role` (ASC), `status` (ASC)
   - Used for: Getting active managers and employees

2. **Composite Index: role + supervisorId + status**
   - Fields: `role` (ASC), `supervisorId` (ASC), `status` (ASC)
   - Used for: Getting employees under a specific manager

### Submissions Collection
1. **Composite Index: userUid + submittedAt**
   - Fields: `userUid` (ASC), `submittedAt` (DESC)
   - Used for: Getting submission history for a specific user

### Invitations Collection
1. **Composite Index: email + status**
   - Fields: `email` (ASC), `status` (ASC)
   - Used for: Checking for existing pending invitations

2. **Composite Index: status + createdAt**
   - Fields: `status` (ASC), `createdAt` (DESC)
   - Used for: Admin dashboard showing invitations by status

## Single Field Indexes (Auto-created by Firestore)
Firestore automatically creates single field indexes for:
- `email` (users, invitations)
- `token` (invitations)
- `submissionId` (ocr_analyses, fraud_analyses)
- `uploadedAt` (receipts)
- `createdAt` (invitations)
- `submittedAt` (submissions)

## Query Performance Benefits
- **Faster Sorting**: All queries with `orderBy` now use indexes instead of client-side sorting
- **Efficient Filtering**: Composite indexes support complex `where` clauses with multiple conditions
- **Reduced Read Operations**: Indexes minimize the number of documents that need to be examined
- **Better Scalability**: Performance remains consistent as data volume grows

## Index Status
- **READY**: Indexes are built and ready for use
- **CREATING**: New indexes are being built (may take a few minutes)
- **FAILED**: Index creation failed (check Firebase console for details)

## Monitoring
- Monitor index usage in the Firebase Console under Firestore > Indexes
- Check query performance in the Firebase Console under Firestore > Usage
- Index build progress can be tracked in the Firebase Console

## Maintenance
- Indexes are automatically maintained by Firestore
- No manual maintenance required
- Indexes are updated automatically when data changes
- Old indexes are cleaned up automatically when no longer needed

## Cost Considerations
- Each index uses additional storage space
- Index writes consume additional write operations
- The performance benefits typically outweigh the additional costs
- Monitor usage in Firebase Console to optimize costs

## Next Steps
1. Monitor query performance after deployment
2. Add additional indexes if new query patterns emerge
3. Remove unused indexes to optimize costs
4. Consider index optimization for high-volume collections
