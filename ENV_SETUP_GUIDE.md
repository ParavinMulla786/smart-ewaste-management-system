# Environment Variables Setup Guide

## Overview
The application now uses environment variables for all sensitive configuration (database credentials, API keys, etc.) instead of hardcoding them in `application.properties`. This allows you to safely commit your code to GitHub without exposing secrets.

## Setup Instructions

### 1. Create `.env` file

Copy the `.env.example` file to create your own `.env` file:

```bash
cd smart-ewaste-backend
cp .env.example .env
```

Or on Windows PowerShell:
```powershell
cd smart-ewaste-backend
Copy-Item .env.example .env
```

### 2. Configure Environment Variables

Open the `.env` file and fill in your actual values:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ewaste_db
MONGODB_DATABASE=ewaste_db

# JWT Configuration
JWT_SECRET=your_actual_secret_key_here
JWT_EXPIRATION=86400000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password
APP_URL=http://localhost:3000

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Server Configuration
SERVER_PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Logging Level
LOGGING_LEVEL=DEBUG
```

### 3. Verify `.gitignore`

Make sure `.env` is listed in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

✅ This is already configured in the project.

### 4. Run the Application

The application will automatically load environment variables from the `.env` file:

```bash
mvn clean install
mvn spring-boot:run
```

## How It Works

### Environment Variable Syntax

The `application.properties` file now uses this syntax:
```properties
property.name=${ENV_VARIABLE:default_value}
```

Example:
```properties
aws.accessKeyId=${AWS_ACCESS_KEY_ID:YOUR_AWS_ACCESS_KEY_ID}
```

- `${AWS_ACCESS_KEY_ID}` - Tries to read from environment variable
- `:YOUR_AWS_ACCESS_KEY_ID` - Falls back to default if not found

### Loading .env Files

The project uses the `spring-dotenv` library to automatically load `.env` files. The dependency is added in `pom.xml`:

```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/...` |
| `AWS_REGION` | AWS Region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 Bucket Name | `smart-ewaste-bucket` |
| `MAIL_USERNAME` | Email username | `your_email@gmail.com` |
| `MAIL_PASSWORD` | Email app password | `xxxx xxxx xxxx xxxx` |

### Optional Variables (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/ewaste_db` | MongoDB connection string |
| `MONGODB_DATABASE` | `ewaste_db` | Database name |
| `JWT_SECRET` | Generated default | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` | Token expiry (24 hours) |
| `SERVER_PORT` | `8080` | Server port |
| `LOGGING_LEVEL` | `DEBUG` | Log level |

## Production Deployment

### Option 1: System Environment Variables

Set environment variables on your server:

**Linux/Mac:**
```bash
export AWS_ACCESS_KEY_ID="your_key"
export AWS_SECRET_ACCESS_KEY="your_secret"
# ... other variables
```

**Windows:**
```powershell
$env:AWS_ACCESS_KEY_ID="your_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret"
# ... other variables
```

### Option 2: Docker Environment Variables

In `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=us-east-1
      # ... other variables
    env_file:
      - .env
```

### Option 3: Cloud Platform Secrets

- **AWS**: Use AWS Secrets Manager or Parameter Store
- **Heroku**: Use Config Vars in dashboard
- **Azure**: Use App Settings
- **Google Cloud**: Use Secret Manager

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore`
- Use different values for dev/staging/production
- Rotate credentials regularly
- Use app-specific passwords for email
- Use IAM roles instead of keys (when on AWS)
- Restrict IAM user permissions to minimum required

### ❌ DON'T:
- Commit `.env` file to Git
- Share `.env` file via email/chat
- Use production credentials in development
- Hardcode secrets in code
- Give IAM users more permissions than needed

## Troubleshooting

### Problem: Environment variables not loading

**Solution:**
1. Verify `.env` file exists in `smart-ewaste-backend/` directory
2. Check file name is exactly `.env` (not `.env.txt`)
3. Run `mvn clean install` to refresh dependencies
4. Restart the application

### Problem: "AWS_ACCESS_KEY_ID not found"

**Solution:**
1. Open `.env` file
2. Make sure the variable is set: `AWS_ACCESS_KEY_ID=your_actual_key`
3. No spaces around `=` sign
4. No quotes needed (unless value contains spaces)

### Problem: Application still using old values

**Solution:**
1. Stop the application completely
2. Run `mvn clean`
3. Restart the application

## Migration from Hardcoded Values

If you're migrating from hardcoded values in `application.properties`:

1. ✅ Create `.env` file with your actual values
2. ✅ Update `application.properties` to use `${ENV_VAR:default}` syntax
3. ✅ Test the application locally
4. ✅ Verify `.env` is in `.gitignore`
5. ✅ Commit only `application.properties` and `.env.example`
6. ✅ Document variables in `.env.example`

## Example `.env` File Structure

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ewaste_db
MONGODB_DATABASE=ewaste_db

# Authentication
JWT_SECRET=super_secret_key_min_256_bits
JWT_EXPIRATION=86400000

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=myapp@gmail.com
MAIL_PASSWORD=app_specific_password
APP_URL=http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=my-app-bucket

# Server
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000
LOGGING_LEVEL=INFO
```

## Verification

To verify environment variables are loaded correctly:

1. Start the application
2. Check logs for any "variable not found" warnings
3. Try uploading an image to S3
4. Try sending an email

If everything works, your configuration is correct!

## Support

For issues:
- Check Spring Boot logs
- Verify `.env` file syntax
- Ensure no trailing spaces in values
- Test with sample values first

---

**Remember:** Never commit the `.env` file to version control!
