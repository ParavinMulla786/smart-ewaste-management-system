# S3 Bucket Configuration for Image Access

## Issue Fixed
The error "The bucket does not allow ACLs" has been resolved. The application no longer sets ACL permissions during upload.

## Required S3 Bucket Configuration

For images to be publicly accessible, you need to configure your S3 bucket with a bucket policy.

### Step 1: Disable ACLs (Already Done)
Your S3 bucket likely has **Block Public Access** enabled, which is good for security. We'll use bucket policies instead of ACLs.

### Step 2: Configure Bucket Policy

1. Go to **AWS S3 Console** → Select your bucket
2. Click **Permissions** tab
3. Scroll to **Bucket Policy** section
4. Click **Edit** and paste the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

**Important:** Replace `YOUR-BUCKET-NAME` with your actual S3 bucket name.

### Step 3: Adjust Block Public Access Settings (If Needed)

1. In your bucket's **Permissions** tab
2. Go to **Block public access (bucket settings)**
3. Click **Edit**
4. Ensure these settings:
   - ✅ **Block public access to buckets and objects granted through new access control lists (ACLs)** - ENABLED
   - ✅ **Block public access to buckets and objects granted through any access control lists (ACLs)** - ENABLED
   - ⚠️ **Block public access to buckets and objects granted through new public bucket or access point policies** - DISABLED
   - ⚠️ **Block all public access** - DISABLED

This configuration allows bucket policies (which we control) but blocks ACLs entirely.

## Alternative: Pre-Signed URLs (More Secure)

If you prefer not to make files publicly accessible, you can use pre-signed URLs:

### Update S3Service.java

Replace the URL generation in `uploadFile()` method:

```java
// Instead of returning public URL
// return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);

// Generate pre-signed URL (valid for 7 days)
GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(fileName)
        .build();

S3Presigner presigner = S3Presigner.builder()
        .region(Region.of(region))
        .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
        .build();

GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofDays(7))
        .getObjectRequest(getObjectRequest)
        .build();

PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
return presignedRequest.url().toString();
```

**Note:** Pre-signed URLs expire after the specified duration and would need to be regenerated.

## Current Configuration

✅ **Fixed:** Application no longer attempts to set ACLs on uploaded files  
✅ **Backend:** Running on http://localhost:8080  
✅ **Frontend:** Running on http://localhost:3000  

## Testing Image Upload

1. **Enable AWS in .env:**
   ```
   AWS_ENABLED=true
   ```

2. **Configure bucket policy** as shown above

3. **Restart backend** (the terminal will auto-reload)

4. **Try uploading an image** in:
   - Profile page: Click on profile image → Select image
   - Pickup Request: Add images in the form

## Verifying Upload

After successful upload:
- Image URL should be: `https://YOUR-BUCKET-NAME.s3.YOUR-REGION.amazonaws.com/profiles/UUID.jpg`
- Open the URL in browser to verify public access
- If you get "Access Denied", review bucket policy settings

## Security Best Practices

1. ✅ Use environment variables for credentials (already done)
2. ✅ Restrict IAM user permissions to specific bucket only
3. ✅ Enable bucket versioning for file recovery
4. ✅ Set up bucket lifecycle rules to delete old files
5. ⚠️ Consider using CloudFront CDN for better performance and DDoS protection
6. ⚠️ Enable AWS CloudTrail for audit logging

## Troubleshooting

**Error: Access Denied**
- Check bucket policy is correctly configured
- Verify Block Public Access settings allow bucket policies

**Error: Invalid Credentials**
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
- Check IAM user has `s3:PutObject` and `s3:GetObject` permissions

**Error: Bucket Not Found**
- Verify AWS_S3_BUCKET_NAME matches your actual bucket name
- Ensure AWS_REGION is correct (e.g., us-east-1, ap-south-1)
