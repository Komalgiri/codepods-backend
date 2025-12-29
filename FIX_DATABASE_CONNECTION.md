# Fix Database Connection Issue

## Current Issue
Prisma cannot reach the Aiven database server at `pg-383ae78c-codepod-123.f.aivencloud.com:20682`

## Solutions

### Solution 1: Update Connection String with Full SSL Parameters

Aiven databases often require explicit SSL certificate parameters. Update your `.env` file:

**Current format (may not work):**
```env
DATABASE_URL="postgres://avnadmin:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/defaultdb?sslmode=require"
```

**Try this format instead:**
```env
DATABASE_URL="postgresql://avnadmin:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/defaultdb?sslmode=require&sslcert=&sslkey=&sslrootcert="
```

Or with connection pooling parameters:
```env
DATABASE_URL="postgresql://avnadmin:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/defaultdb?sslmode=require&connect_timeout=10"
```

### Solution 2: Check Aiven Dashboard

1. **Verify Service Status:**
   - Log into Aiven Console
   - Check if the PostgreSQL service is **Running** (not paused/stopped)
   - Services can be paused to save costs

2. **Check Connection Information:**
   - Go to your PostgreSQL service
   - Click "Connection information"
   - Copy the **exact** connection string from there
   - It should look like: `postgresql://avnadmin:xxx@host:port/dbname?sslmode=require`

3. **Check IP Whitelist:**
   - Go to "Network" or "Access control" in Aiven
   - Ensure your current IP address is whitelisted
   - Or enable "Allow access from anywhere" for testing

### Solution 3: Test Connection with psql

If you have PostgreSQL client installed, test directly:

```bash
psql "postgresql://avnadmin:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/defaultdb?sslmode=require"
```

If this works, the issue is with Prisma. If this fails, the issue is network/database access.

### Solution 4: Use Aiven Connection Pooler

Aiven provides a connection pooler that might be more reliable:

1. In Aiven dashboard, find "Connection Pooling" or "PgBouncer"
2. Use the pooler connection string instead
3. It typically uses a different port (usually 20681)

### Solution 5: Check Network/Firewall

- **VPN:** If you're on a VPN, try disconnecting/reconnecting
- **Corporate Firewall:** May block outbound connections
- **ISP:** Some ISPs block database ports
- **Windows Firewall:** Check if it's blocking the connection

### Solution 6: Verify Database is Running

Run this to check if the service is accessible:

```bash
# Test if port is open (Windows PowerShell)
Test-NetConnection -ComputerName pg-383ae78c-codepod-123.f.aivencloud.com -Port 20682
```

If this fails, the database server is not accessible from your network.

### Solution 7: Use Direct URL from Aiven

1. Go to Aiven Console → Your PostgreSQL service
2. Click "Connection information"
3. Look for "Service URI" or "Connection string"
4. Copy it exactly as shown
5. Replace the password placeholder with your actual password
6. Update `.env` with this exact string

### Solution 8: Temporary Workaround - Local Database

For development, you can use a local PostgreSQL:

1. Install PostgreSQL locally
2. Create database: `createdb codepods_dev`
3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_local_password@localhost:5432/codepods_dev"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Most Likely Causes

Based on the error, the most likely issues are:

1. **Service is Paused** - Aiven services can be paused. Check dashboard.
2. **IP Not Whitelisted** - Your IP needs to be in the allowlist
3. **Network Blocking** - Firewall/VPN blocking the connection
4. **Wrong Connection String** - Format might need adjustment

## Next Steps

1. ✅ Check Aiven dashboard - Is service running?
2. ✅ Check IP whitelist - Is your IP allowed?
3. ✅ Try connection string from Aiven dashboard (exact copy)
4. ✅ Test with psql if available
5. ✅ Check network/firewall settings

## Quick Test

After updating `.env`, test again:

```bash
node test-db-connection.js
```

Or:

```bash
npx prisma db pull
```

