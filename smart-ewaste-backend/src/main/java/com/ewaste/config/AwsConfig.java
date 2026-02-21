package com.ewaste.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS Configuration
 * Configures AWS S3 client with credentials and region
 * S3Client bean is only created if AWS credentials are properly configured
 */
@Configuration
public class AwsConfig {

    @Value("${aws.accessKeyId:}")
    private String accessKeyId;

    @Value("${aws.secretKey:}")
    private String secretKey;

    @Value("${aws.region:us-east-1}")
    private String region;

    /**
     * Creates and configures S3 Client bean
     * Only created if aws.enabled=true and credentials are provided
     * @return Configured S3Client
     */
    @Bean
    @ConditionalOnProperty(name = "aws.enabled", havingValue = "true", matchIfMissing = false)
    public S3Client s3Client() {
        // Check if credentials are provided
        if (accessKeyId == null || accessKeyId.isEmpty() || accessKeyId.equals("YOUR_AWS_ACCESS_KEY_ID")) {
            throw new IllegalStateException("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID in .env file");
        }
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(
                accessKeyId,
                secretKey
        );

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }
}
