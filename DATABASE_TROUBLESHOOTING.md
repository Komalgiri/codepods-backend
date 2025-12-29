# Database Connection Troubleshooting

## Error
```
Can't reach database server at `pg-383ae78c-codepod-123.f.aivencloud.com:20682`
```

## Common Causes & Solutions

### 1. Missing or Incorrect DATABASE_URL

**Check your `.env` file exists and has the correct format:**

```env
DATABASE_URL="postgresql://username:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/database_name?sslmode=require"
```

**For Aiven databases, you typically need:**
- `sslmode=require` or `sslmode=prefer` (SSL is usually required)
- Correct username and password
- Correct database name

### 2. Database Server Not Running

- Check your Aiven dashboard to ensure the database service is running
- Verify the host and port are correct

### 3. Network/Firewall Issues

- Ensure your IP is whitelisted in Aiven (if IP restrictions are enabled)
- Check if you're behind a VPN or firewall that might block the connection

### 4. Connection String Format

**Aiven PostgreSQL connection string format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require
```

**Example:**
```env
DATABASE_URL="postgresql://avnadmin:your_password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/defaultdb?sslmode=require"
```

### 5. Test Connection

You can test the connection using:

```bash
# Using psql (if installed)
psql "postgresql://username:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/database_name?sslmode=require"

# Or using Prisma Studio
npx prisma studio
```

### 6. Regenerate Prisma Client

After fixing the DATABASE_URL, regenerate the Prisma client:

```bash
npx prisma generate
```

### 7. Check Aiven Dashboard

1. Log into your Aiven account
2. Go to your PostgreSQL service
3. Check the "Connection information" section
4. Copy the connection string from there
5. Make sure the service status is "Running"

## Quick Fix Steps

1. **Create/Update `.env` file** in the project root:
   ```env
   DATABASE_URL="postgresql://username:password@pg-383ae78c-codepod-123.f.aivencloud.com:20682/database_name?sslmode=require"
   JWT_SECRET="your-jwt-secret-here"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   PORT=5000
   ```

2. **Verify the connection string** from Aiven dashboard

3. **Test the connection:**
   ```bash
   npx prisma db pull
   ```

4. **If still failing**, check:
   - Aiven service is running
   - IP whitelist settings
   - SSL certificate requirements
   - Network connectivity

## Alternative: Use Local Database for Development

If you want to use a local PostgreSQL database for development:

1. Install PostgreSQL locally
2. Create a database
3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/codepods_dev"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

