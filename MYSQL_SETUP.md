# MySQL Database Setup Guide

## Prerequisites
- MySQL Server 8.0 or higher installed
- MySQL Workbench or command line access

## Step 1: Install MySQL

### Windows
1. Download MySQL from: https://dev.mysql.com/downloads/installer/
2. Install MySQL Server 8.0
3. Remember your root password

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS
```bash
brew install mysql
brew services start mysql
```

## Step 2: Create Database

### Option A: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `Database/schema_mysql.sql`
4. Execute the entire script (File → Run SQL Script)

### Option B: Using Command Line
```bash
mysql -u root -p
```

Then run:
```sql
source Database/schema_mysql.sql
```

Or:
```bash
mysql -u root -p < Database/schema_mysql.sql
```

## Step 3: Update Connection String

Edit `Backend/HotelAPI/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=HotelDB;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
  }
}
```

**Replace `YOUR_PASSWORD` with your MySQL root password.**

## Step 4: Install MySQL Package

In the backend project directory:
```bash
cd Backend/HotelAPI
dotnet restore
```

This will install `Pomelo.EntityFrameworkCore.MySql` package.

## Step 5: Run Database Migrations (Optional)

If you want to use Entity Framework migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**OR** just use the SQL script (recommended for this project).

## Step 6: Test Connection

Run the backend:
```bash
dotnet run
```

If you see no database errors, the connection is working!

## Default Accounts

After running the schema, these accounts are available:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| ahmed | admin123 | Staff |
| fatma | admin123 | Staff |
| customer1 | admin123 | Customer |
| customer2 | admin123 | Customer |

## Troubleshooting

### Error: "Access denied for user"
- Check your password in `appsettings.json`
- Make sure MySQL server is running
- Verify user has permissions

### Error: "Unknown database 'HotelDB'"
- Run the `schema_mysql.sql` script first
- Check database name matches in connection string

### Error: "Table doesn't exist"
- Make sure you ran the entire SQL script
- Check if tables were created: `SHOW TABLES;`

### Port 3306 Connection Refused
- Make sure MySQL server is running
- Check firewall settings
- Verify port in connection string

## Verify Database

Connect to MySQL and check:
```sql
USE HotelDB;
SHOW TABLES;
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Rooms;
```

You should see:
- 9 tables
- 5 users
- 4 room types
- 50 rooms

