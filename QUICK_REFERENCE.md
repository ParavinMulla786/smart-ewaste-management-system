# Quick Reference - AWS S3 Image Upload

## Backend API Endpoints

### 1. Upload Profile Image
```http
POST /api/files/upload/profile-image
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body: file (image file)

Response:
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://bucket.s3.region.amazonaws.com/profile-images/uuid.jpg"
}
```

### 2. Upload E-Waste Images
```http
POST /api/files/upload/ewaste-images
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body: files[] (multiple image files)

Response:
{
  "success": true,
  "message": "Images uploaded successfully",
  "imageUrls": [
    "https://bucket.s3.region.amazonaws.com/ewaste-images/uuid1.jpg",
    "https://bucket.s3.region.amazonaws.com/ewaste-images/uuid2.jpg"
  ]
}
```

### 3. Delete Profile Image
```http
DELETE /api/files/delete/profile-image
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

## Configuration

### application.properties
```properties
# AWS S3 Configuration
aws.accessKeyId=YOUR_AWS_ACCESS_KEY_ID
aws.secretKey=YOUR_AWS_SECRET_ACCESS_KEY
aws.region=us-east-1
aws.s3.bucketName=smart-ewaste-bucket

# File Upload Limits
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
```

## Frontend Usage

### Profile Image Upload (Profile.jsx)
```javascript
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/files/upload/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Update UI with response.data.imageUrl
};
```

### E-Waste Images Upload (SchedulePickup.jsx)
```javascript
const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await api.post('/files/upload/ewaste-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Use response.data.imageUrls in pickup request
};
```

## Constraints

| Property | Value |
|----------|-------|
| Max file size | 5MB per image |
| Max request size | 10MB |
| Allowed formats | All image formats (jpg, png, gif, etc.) |
| Profile images | 1 per user (replaces previous) |
| E-waste images | Multiple per request |

## S3 Folder Structure

```
smart-ewaste-bucket/
├── profile-images/
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── ...
└── ewaste-images/
    ├── uuid3.jpg
    ├── uuid4.png
    └── ...
```

## Key Classes

### Backend
- `AwsConfig.java` - S3 client configuration
- `S3Service.java` - File upload/delete operations
- `FileUploadController.java` - REST API endpoints
- `User.java` - Has `profileImageUrl` field
- `PickupRequest.java` - Has `images` field (List<String>)

### Frontend
- `Profile.jsx` - Profile image upload UI
- `SchedulePickup.jsx` - E-waste images upload UI
- `Profile.css` - Profile image styles
- `SchedulePickup.css` - Upload status styles

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Access Denied | Invalid credentials | Check AWS keys |
| File too large | Size > 5MB | Compress image |
| Invalid file type | Not an image | Select image file |
| Bucket not found | Wrong bucket name | Verify bucket name |
| Connection refused | Wrong region | Check AWS region |

## Testing Commands

### Test Backend
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Test endpoint (requires JWT token)
curl -X POST http://localhost:8080/api/files/upload/profile-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Test Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables (Production)

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
export AWS_S3_BUCKET_NAME=smart-ewaste-bucket
```

## Monitoring

### Check S3 Usage
1. Go to AWS S3 Console
2. Select your bucket
3. Check "Metrics" tab for:
   - Storage size
   - Number of objects
   - Request metrics

### Backend Logs
```bash
# Check Spring Boot logs
tail -f smart-ewaste-backend/logs/application.log

# Check for S3 errors
grep "S3Exception" smart-ewaste-backend/logs/application.log
```

## Security Checklist

- [ ] AWS credentials not committed to Git
- [ ] Bucket policy allows public read
- [ ] File type validation enabled
- [ ] File size limits enforced
- [ ] JWT authentication required
- [ ] Old images deleted on update
- [ ] CORS configured correctly

## Performance Tips

1. Enable S3 Transfer Acceleration for faster uploads
2. Use CloudFront CDN for image delivery
3. Implement image compression before upload
4. Generate thumbnails for image previews
5. Use lazy loading for image galleries
6. Cache image URLs in frontend

## Cost Optimization

1. Set up S3 lifecycle policies to delete old images
2. Use S3 Intelligent-Tiering for storage class
3. Compress images to reduce storage
4. Monitor and set up billing alerts
5. Use S3 Analytics to optimize storage

## Useful AWS CLI Commands

```bash
# List bucket contents
aws s3 ls s3://smart-ewaste-bucket/

# Upload file manually
aws s3 cp image.jpg s3://smart-ewaste-bucket/profile-images/

# Download file
aws s3 cp s3://smart-ewaste-bucket/profile-images/uuid.jpg ./

# Delete file
aws s3 rm s3://smart-ewaste-bucket/profile-images/uuid.jpg

# Sync local folder to S3
aws s3 sync ./images s3://smart-ewaste-bucket/backup/
```

## Support Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for Java](https://docs.aws.amazon.com/sdk-for-java/)
- [Spring Boot File Upload](https://spring.io/guides/gs/uploading-files/)
- [AWS S3 Pricing Calculator](https://calculator.aws/)

---

For detailed setup instructions, see `AWS_S3_SETUP_GUIDE.md`
