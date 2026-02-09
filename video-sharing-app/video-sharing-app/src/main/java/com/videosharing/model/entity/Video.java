package com.videosharing.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
public class Video {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	private String title;
	private String description;

	@Column(nullable = true)
	private String videoUrl;

	private String thumbnailUrl;

	@Column(name = "categories")
	private String categories; // Stored as JSON string or comma-separated

	private String location;
	private String tags;
	private String rejectionReason;

	@Enumerated(EnumType.STRING)
	private Status status = Status.PENDING;

	// Status Enum
	public enum Status {
		PENDING,
		APPROVED,
		REJECTED
	}

	public enum ContentType {
		VIDEO,
		IMAGE
	}

	@Enumerated(EnumType.STRING)
	private ContentType contentType = ContentType.VIDEO; // Default to VIDEO

	@Column(nullable = false)
	private Integer likesCount = 0;

	@Column(nullable = false)
	private Integer dislikesCount = 0;

	@Column(nullable = false, columnDefinition = "bigint default 0")
	private Long views = 0L;

	@Column(nullable = false, columnDefinition = "integer default 0")
	private Integer shareCount = 0;

	private LocalDateTime createdAt = LocalDateTime.now();
	private LocalDateTime expiresAt; // Will be set to 6 days after creation

	// Constructors, getters, and setters
	public Video() {
	}

	public Video(User user, String title, String description, String videoUrl, String thumbnailUrl) {
		this.user = user;
		this.title = title;
		this.description = description;
		this.videoUrl = videoUrl;
		this.thumbnailUrl = thumbnailUrl;
		this.expiresAt = LocalDateTime.now().plusDays(6); // Expires in 6 days
		this.status = Status.PENDING;
	}

	// Getters and setters...

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getVideoUrl() {
		return videoUrl;
	}

	public void setVideoUrl(String videoUrl) {
		this.videoUrl = videoUrl;
	}

	public String getThumbnailUrl() {
		return thumbnailUrl;
	}

	public void setThumbnailUrl(String thumbnailUrl) {
		this.thumbnailUrl = thumbnailUrl;
	}

	public String getCategories() {
		return categories;
	}

	public void setCategories(String categories) {
		this.categories = categories;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Integer getLikesCount() {
		return likesCount;
	}

	public void setLikesCount(Integer likesCount) {
		this.likesCount = likesCount;
	}

	public Integer getDislikesCount() {
		return dislikesCount;
	}

	public void setDislikesCount(Integer dislikesCount) {
		this.dislikesCount = dislikesCount;
	}

	public Long getViews() {
		return views;
	}

	public void setViews(Long views) {
		this.views = views;
	}

	public Integer getShareCount() {
		return shareCount;
	}

	public void setShareCount(Integer shareCount) {
		this.shareCount = shareCount;
	}

	public ContentType getContentType() {
		return contentType;
	}

	public void setContentType(ContentType contentType) {
		this.contentType = contentType;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public void setExpiresAt(LocalDateTime expiresAt) {
		this.expiresAt = expiresAt;
	}
}