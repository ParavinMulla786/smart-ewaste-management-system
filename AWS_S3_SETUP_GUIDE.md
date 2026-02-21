# AWS S3 Configuration Guide

## Overview
This application now supports uploading profile images and e-waste device images to AWS S3 bucket.

## Features Implemented

### 1. Profile Image Upload (User Dashboard)
- Users can upload a profile image from the Profile page
- Image preview before upload
- Upload to AWS S3 bucket in `profile-images/` folder
- Delete existing profile image
- Images are stored in User model with `profileImageUrl` field

### 2. E-Waste Device Image Upload (Pickup Request Form)
- Users can upload up to 5 images of e-waste devices
- Image preview before submission
- Images are uploaded to AWS S3 bucket in `ewaste-images/` folder
- Image URLs are stored with the pickup request

## AWS S3 Setup Instructions

### Step 1: Create an AWS S3 Bucket

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `smart-ewaste-images`)
5. Select a region (e.g., `us-east-1`)
6. **Important**: Configure the following settings:
   - Block Public Access: Uncheck "Block all public access" (or configure bucket policy for public read)
   - Bucket Versioning: Enable (optional but recommended)
   - Encryption: Enable server-side encryption (recommended)
7. Click "Create bucket"

### Step 2: Configure Bucket Policy (for public read access)

1. Go to your bucket
2. Click on "Permissions" tab
3. Scroll to "Bucket policy"
4. Add the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### Step 3: Create IAM User with S3 Access

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Enter username (e.g., `ewaste-app-user`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Search and select `AmazonS3FullAccess` (or create a custom policy for your bucket only)
8. Click through to create the user
9. **IMPORTANT**: Save the Access Key ID and Secret Access Key - you won't see them again!

### Step 4: Configure Application

Update `smart-ewaste-backend/src/main/resources/application.properties`:

```properties
# AWS S3 Configuration
aws.s3.bucket-name=your-bucket-name
aws.s3.region=us-east-1
aws.access-key-id=YOUR_ACCESS_KEY_ID
aws.secret-access-key=YOUR_SECRET_ACCESS_KEY
```

**Security Best Practice**: Instead of hardcoding credentials, use environment variables:

```properties
aws.s3.bucket-name=${AWS_S3_BUCKET_NAME:your-bucket-name}
aws.s3.region=${AWS_REGION:us-east-1}
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
```

Then set environment variables:
```bash
# Windows (PowerShell)
$env:AWS_S3_BUCKET_NAME="your-bucket-name"
$env:AWS_REGION="us-east-1"
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"

# Linux/Mac
export AWS_S3_BUCKET_NAME="your-bucket-name"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```

## API Endpoints

### Profile Image Upload
- **Endpoint**: `POST /api/user/upload-profile-image`
- **Auth**: Required (JWT token)
- **Body**: `multipart/form-data` with `file` field
- **Max Size**: 5MB
- **Response**: 
  ```json
  {
    "imageUrl": "https://bucket-name.s3.region.amazonaws.com/profile-images/uuid.jpg",
    "message": "Profile image uploaded successfully"
  }
  ```

### Profile Image Delete
- **Endpoint**: `DELETE /api/user/delete-profile-image`
- **Auth**: Required (JWT token)
- **Response**: 
  ```json
  {
    "message": "Profile image deleted successfully"
  }
  ```

### E-Waste Images Upload
- **Endpoint**: `POST /api/user/upload-ewaste-images`
- **Auth**: Required (JWT token)
- **Body**: `multipart/form-data` with `files[]` field (multiple files)
- **Max Files**: 5
- **Max Size per file**: 5MB
- **Response**: 
  ```json
  {
    "imageUrls": ["url1", "url2", "url3"],
    "message": "Images uploaded successfully",
    "count": 3
  }
  ```

## File Size and Type Restrictions

- **Allowed Types**: Images only (JPEG, PNG, GIF, etc.)
- **Max Size**: 5MB per image
- **Max Files**: 5 images per pickup request

## Backend Changes Summary

1. **Dependencies Added**:
   - AWS SDK for S3 (v2.20.26)

2. **New Files Created**:
   - `S3Service.java` - Handles S3 operations (upload, delete, validation)

3. **Files Modified**:
   - `pom.xml` - Added AWS S3 dependency
   - `application.properties` - Added S3 configuration
   - `User.java` - Added `profileImageUrl` field
   - `UserController.java` - Added image upload/delete endpoints

## Frontend Changes Summary

1. **Profile.jsx**:
   - Added profile image upload UI with preview
   - Upload button to send image to backend
   - Delete button to remove profile image
   - Display uploaded image instead of emoji avatar

2. **SchedulePickup.jsx**:
   - Added multiple image upload with preview
   - Images are uploaded to S3 before form submission
   - Remove individual images before upload
   - Progress indicator during upload

## Testing

1. **Test Profile Image Upload**:
   - Go to Profile page
   - Click "Choose Image" button
   - Select an image (< 5MB)
   - Preview should appear
   - Click "Upload" button
   - Image should appear in the profile avatar area

2. **Test E-Waste Image Upload**:
   - Go to Schedule Pickup page
   - Fill in the form
   - Select up to 5 images
   - Preview should appear with remove buttons
   - Submit the form
   - Images should be uploaded to S3 and URLs stored with request

## Troubleshooting

### Issue: "Access Denied" Error
**Solution**: Check bucket policy and IAM user permissions

### Issue: "Failed to upload image"
**Solution**: 
- Verify AWS credentials in application.properties
- Check bucket name and region
- Ensure bucket policy allows PutObject

### Issue: Images not displaying
**Solution**:
- Check bucket policy allows GetObject (public read)
- Verify image URLs are accessible in browser
- Check CORS configuration if accessing from different domain

### Issue: "File size too large"
**Solution**: Ensure images are under 5MB. Compress large images before upload.

## Security Recommendations

1. **Never commit AWS credentials to version control**
2. Use environment variables or AWS IAM roles (if deployed on AWS)
3. Implement virus scanning for uploaded files (optional)
4. Add rate limiting to prevent abuse
5. Use signed URLs for private content (if needed)
6. Regularly rotate AWS access keys
7. Use separate buckets for different environments (dev, staging, prod)

## Cost Considerations

- S3 storage costs depend on usage
- First 5GB/month is free (AWS Free Tier)
- Consider implementing image compression to reduce storage costs
- Set up S3 lifecycle policies to delete old/unused images

## Future Enhancements

- [ ] Image compression before upload
- [ ] Support for image cropping/editing
- [ ] Thumbnail generation
- [ ] Progress bar during upload
- [ ] Drag-and-drop image upload
- [ ] Support for video uploads (for e-waste demonstrations)

## Support

For issues or questions, please refer to:
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- Spring Boot File Upload: https://spring.io/guides/gs/uploading-files/
