# Auto-Rejection Feature

## Overview
The system automatically rejects pickup requests that remain in PENDING status for more than 5 days without admin approval.

## How It Works

### Automatic Scheduling
- **Schedule**: Runs daily at 2:00 AM
- **Process**: 
  1. Finds all PENDING requests created more than 5 days ago
  2. Changes their status to REJECTED
  3. Adds admin notes: "Automatically rejected - No admin action taken within 5 days"
  4. Sends rejection email to users

### Email Notification
Users receive an email explaining:
- Their request was not reviewed within 5 days
- They can submit a new request if needed

### Manual Trigger
Admins can manually trigger the auto-rejection task via API:
- **Endpoint**: `POST /api/admin/scheduler/auto-reject-old-requests`
- **Authorization**: Admin role required
- **Use Case**: Testing or immediate execution

## Configuration

### Scheduler Settings
Located in: `PickupRequestScheduler.java`

```java
// Daily at 2 AM
@Scheduled(cron = "0 0 2 * * *")

// Alternative: Run every hour (uncomment to use)
// @Scheduled(fixedRate = 3600000)
```

### Rejection Period
Default: 5 days
To change, modify in `PickupRequestScheduler.java`:
```java
LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
// Change 5 to desired number of days
```

## Database Query
Uses MongoDB query:
```java
findByStatusAndCreatedAtBefore("PENDING", fiveDaysAgo)
```

## Logging
Console logs include:
- Task execution start
- Number of requests found
- Each request rejection (ID and user email)
- Task completion or errors

## Benefits
1. **User Experience**: Users get timely feedback
2. **System Cleanliness**: No indefinitely pending requests
3. **Admin Workload**: Reduces backlog of old requests
4. **Transparency**: Clear communication with users
