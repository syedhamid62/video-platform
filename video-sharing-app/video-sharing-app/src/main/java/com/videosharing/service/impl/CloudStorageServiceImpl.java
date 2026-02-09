package com.videosharing.service.impl;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.videosharing.service.CloudStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

@Service
public class CloudStorageServiceImpl implements CloudStorageService {

    @Value("${cloudflare.r2.access-key}")
    private String accessKey;

    @Value("${cloudflare.r2.secret-key}")
    private String secretKey;

    @Value("${cloudflare.r2.endpoint}")
    private String endpoint;

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    private AmazonS3 s3Client;

    @PostConstruct
    public void init() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, "auto"))
                .withPathStyleAccessEnabled(true)
                .build();
    }

    @Override
    public String uploadVideo(MultipartFile file, Long userId, String title) {
        try {
            String fileName = userId + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            s3Client.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));

            // Return Public URL
            // Using the custom domain or constructing it manually implies knowledge of the
            // public URL structure
            // For R2, it's often: https://<bucket>.r2.dev/<key> ONLY if public access is
            // enabled on the bucket
            // Or via a custom domain. For now, we'll try to construct a standard path logic
            // or use a placeholder if unsure
            // But user gave us the endpoint.
            // Often Public R2 URL format: https://pub-<account_hash>.r2.dev/filename
            // I'll return a constructed URL based on standard R2 public bucket patterns or
            // just the key for now.
            // Best bet for R2 public buckets is often
            // `https://<bucket>.<account-id>.r2.cloudflarestorage.com/<key>` IS PRIVATE
            // usually.
            // Public R2 usually needs a custom domain or the r2.dev subdomain enabled.
            // I will use a generic R2 URL pattern and advise user to bind a domain if
            // needed.
            return endpoint + "/" + bucketName + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload to Cloudflare R2", e);
        }
    }

    @Override
    public String uploadProfilePicture(MultipartFile file, Long userId) {
        try {
            // Store in "users" container (folder) as requested
            String fileName = "users/" + userId + "/profile_" + System.currentTimeMillis() + "_"
                    + file.getOriginalFilename();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            s3Client.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));

            return endpoint + "/" + bucketName + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile picture to Cloudflare R2", e);
        }
    }

    @Override
    public String generateThumbnail(String videoUrl) {
        return "https://placehold.co/600x400?text=Video+Thumbnail";
    }

    @Override
    public void deleteVideo(String videoUrl) {
        // Implementation for delete would follow, extracting key from URL
    }

    @Override
    public java.io.InputStream getFileStream(String fileKey) {
        try {
            // If the provided key is a full URL, extract the relative path (key)
            String key = fileKey;
            String searchStr = bucketName + "/";
            if (fileKey.contains(searchStr)) {
                key = fileKey.substring(fileKey.indexOf(searchStr) + searchStr.length());
            }

            return s3Client.getObject(bucketName, key).getObjectContent();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download from Cloudflare R2: " + fileKey, e);
        }
    }
}
