# Before Pushing to GitHub - Security Checklist ✅

## ⚠️ IMPORTANT: Read Before Committing

This guide ensures you don't accidentally commit sensitive data to GitHub.

## Quick Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No credentials in `application.properties`
- [ ] `.env.example` has placeholder values only
- [ ] All sensitive data uses environment variables
- [ ] Tested application with `.env` file

## Step-by-Step Pre-Commit Checklist

### 1. Verify `.gitignore` is Correct

Check that your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

✅ **Status:** Already configured in `smart-ewaste-backend/.gitignore`

### 2. Check `.env` File

**DO NOT COMMIT THIS FILE!**

Your `.env` file should contain real credentials:
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/...
MAIL_USERNAME=cleanstreet02@gmail.com
MAIL_PASSWORD=nstm ipap lpgq bjll
```

✅ **Status:** File is listed in `.gitignore`

### 3. Verify `.env.example` Has No Secrets

The `.env.example` file should only have placeholder values:
```env
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_password
```

✅ **Status:** File has placeholders only

### 4. Check `application.properties`

Verify all sensitive values use environment variables:

✅ Email credentials use `${MAIL_USERNAME}` and `${MAIL_PASSWORD}`
✅ AWS credentials use `${AWS_ACCESS_KEY_ID}` and `${AWS_SECRET_ACCESS_KEY}`
✅ JWT secret uses `${JWT_SECRET}`
✅ MongoDB credentials use `${MONGODB_USERNAME}` (if applicable)

### 5. Test the Application

Before committing, make sure everything works:

```bash
cd smart-ewaste-backend
mvn clean install
mvn spring-boot:run
```

Test these features:
- [ ] Login works (JWT)
- [ ] Email sending works
- [ ] Profile image upload works (AWS S3)
- [ ] E-waste image upload works (AWS S3)

### 6. Check What Will Be Committed

Run this command to see what files will be committed:

```bash
git status
```

**Files that SHOULD be committed:**
- ✅ `application.properties` (with environment variables)
- ✅ `.env.example` (with placeholder values)
- ✅ `.gitignore`
- ✅ All Java source files
- ✅ `pom.xml`
- ✅ Documentation files

**Files that SHOULD NOT be committed:**
- ❌ `.env` (contains real credentials)
- ❌ `.env.local`
- ❌ Any file with real passwords/keys

### 7. Verify Specific Files

Check these files don't contain secrets:

```bash
# Check application.properties
cat smart-ewaste-backend/src/main/resources/application.properties | grep -E "(password|secret|key)" 
```

Should show only `${ENV_VAR}` syntax, not actual values.

## How to Push Safely

### First Time Setup

1. **Verify `.gitignore`:**
   ```bash
   cat smart-ewaste-backend/.gitignore | grep ".env"
   ```
   Should show `.env` is ignored.

2. **Check git status:**
   ```bash
   git status
   ```
   `.env` should NOT appear in the list.

3. **Add files:**
   ```bash
   git add .
   ```

4. **Double-check staged files:**
   ```bash
   git status
   ```
   Verify `.env` is not in "Changes to be committed"

5. **Commit:**
   ```bash
   git commit -m "Add AWS S3 integration with environment variables"
   ```

6. **Push:**
   ```bash
   git push origin your-branch-name
   ```

## If You Accidentally Committed Secrets

### Option 1: Immediately Remove from Last Commit

If you just committed but haven't pushed:

```bash
# Remove sensitive file from last commit
git rm --cached smart-ewaste-backend/.env
git commit --amend -m "Add AWS S3 integration (removed .env)"
```

### Option 2: If Already Pushed

**⚠️ CRITICAL: Rotate all secrets immediately!**

1. **Remove file from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch smart-ewaste-backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Force push:**
   ```bash
   git push origin --force --all
   ```

3. **Rotate ALL credentials:**
   - Generate new AWS access keys
   - Change Gmail app password
   - Update JWT secret
   - Update all services using old credentials

## Team Collaboration

### For New Team Members

Share this instruction:

1. **Clone the repository**
2. **Copy `.env.example` to `.env`:**
   ```bash
   cd smart-ewaste-backend
   cp .env.example .env
   ```
3. **Request credentials** from team lead (via secure channel, not email/Slack)
4. **Fill in `.env`** with provided credentials
5. **Never commit `.env`** to Git

### Sharing Credentials Securely

**✅ DO:**
- Use password managers (1Password, LastPass)
- Use secure messaging (Signal, encrypted email)
- Share in person
- Use organization's secrets management system

**❌ DON'T:**
- Email credentials
- Put in Slack/Discord/Teams
- Store in shared Google Docs
- Commit to Git

## Automated Checks

### Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check if .env file is being committed
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "This file contains secrets and should not be committed."
    echo "Remove it from staging: git reset HEAD .env"
    exit 1
fi

# Check for hardcoded secrets in application.properties
if git diff --cached smart-ewaste-backend/src/main/resources/application.properties | grep -qE "password=(?!\$\{)"; then
    echo "⚠️ WARNING: Possible hardcoded password in application.properties"
    echo "Make sure to use environment variables: \${ENV_VAR}"
    exit 1
fi

echo "✅ Pre-commit checks passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## GitHub Security Features

Enable these on your repository:

1. **Secret Scanning:**
   - Settings → Security → Code security and analysis
   - Enable "Secret scanning"

2. **Dependabot Alerts:**
   - Enable "Dependabot alerts"
   - Get notified of vulnerable dependencies

3. **Branch Protection:**
   - Require pull request reviews
   - Require status checks

## Files Overview

### Safe to Commit ✅

| File | Contains | Safe? |
|------|----------|-------|
| `application.properties` | `${ENV_VAR}` syntax | ✅ Yes |
| `.env.example` | Placeholder values | ✅ Yes |
| `.gitignore` | Rules | ✅ Yes |
| Java source files | Code only | ✅ Yes |
| `pom.xml` | Dependencies | ✅ Yes |
| Documentation | Instructions | ✅ Yes |

### Never Commit ❌

| File | Contains | Safe? |
|------|----------|-------|
| `.env` | Real credentials | ❌ No |
| `.env.local` | Local overrides | ❌ No |
| Any file with passwords | Secrets | ❌ No |

## Verification Commands

Run these before pushing:

```bash
# 1. Check if .env is tracked
git ls-files | grep "\.env$"
# Should return nothing

# 2. Check git status
git status
# .env should not appear

# 3. Check staged files
git diff --cached --name-only
# .env should not be listed

# 4. Check for hardcoded secrets (optional)
git diff --cached | grep -i "password\|secret\|key"
# Should only show ${ENV_VAR} syntax
```

## Final Checklist Before Push

- [ ] `.env` file exists locally with real credentials
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] `application.properties` uses `${ENV_VAR}` syntax
- [ ] Application tested and working locally
- [ ] `git status` doesn't show `.env`
- [ ] Reviewed all files being committed
- [ ] No hardcoded secrets in any file
- [ ] Team members know how to set up `.env`
- [ ] Documentation updated

## Need Help?

If you're unsure about anything:
1. Run `git status` and share output with team
2. Check `.gitignore` file
3. Review this checklist again
4. Ask team lead before pushing

---

**Remember: Prevention is better than secret rotation!**

🔒 **When in doubt, don't commit. Ask first.**
