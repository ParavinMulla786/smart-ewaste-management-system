package com.ewaste.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * S3 Service
 * Handles file upload operations to AWS S3
 */
@Service
public class S3Service {

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${aws.s3.bucketName:}")
    private String bucketName;

    @Value("${aws.region:us-east-1}")
    private String region;

    @Value("${aws.enabled:false}")
    private boolean awsEnabled;

    /**
     * Check if AWS S3 is properly configured
     */
    private void validateS3Configuration() {
        if (!awsEnabled || s3Client == null) {
            throw new RuntimeException("AWS S3 is not configured. Please configure AWS credentials in .env file and set aws.enabled=true in application.properties");
        }
    }

    /**
     * Upload a single file to S3
     * 
     * @param file MultipartFile to upload
     * @param folder Folder path in S3 bucket (e.g., "profile-images", "ewaste-images")
     * @return URL of uploaded file
     * @throws IOException if file read fails
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Validate S3 configuration
        validateS3Configuration();
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Generate unique file name
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
        String fileName = folder + "/" + UUID.randomUUID().toString() + extension;

        // Upload to S3
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    // Removed ACL - bucket must have public access configured via bucket policy
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Return public URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", 
                    bucketName, region, fileName);

        } catch (S3Exception e) {
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Upload multiple files to S3
     * 
     * @param files Array of MultipartFile to upload
     * @param folder Folder path in S3 bucket
     * @return List of URLs of uploaded files
     * @throws IOException if file read fails
     */
    public List<String> uploadMultipleFiles(MultipartFile[] files, String folder) throws IOException {
        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = uploadFile(file, folder);
                uploadedUrls.add(url);
            }
        }

        return uploadedUrls;
    }

    /**
     * Delete a file from S3
     * 
     * @param fileUrl URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract key from URL
            String key = extractKeyFromUrl(fileUrl);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (S3Exception e) {
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * Extract S3 key from full URL
     * 
     * @param url Full S3 URL
     * @return S3 key (file path)
     */
    private String extractKeyFromUrl(String url) {
        // URL format: https://bucket-name.s3.region.amazonaws.com/key
        String[] parts = url.split(".amazonaws.com/");
        if (parts.length > 1) {
            return parts[1];
        }
        throw new IllegalArgumentException("Invalid S3 URL");
    }

    /**
     * Check if bucket exists and is accessible
     * 
     * @return true if bucket exists
     */
    public boolean isBucketAccessible() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(headBucketRequest);
            return true;
        } catch (S3Exception e) {
            return false;
        }
    }
}
