package com.videosharing.repository;

import com.videosharing.model.entity.Video;
import com.videosharing.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {

    Page<Video> findByStatus(Video.Status status, Pageable pageable);

    List<Video> findByUser(User user);

    List<Video> findByStatus(Video.Status status);

    List<Video> findByExpiresAtBefore(LocalDateTime time);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Video v WHERE v.status = :status " +
            "AND (:category IS NULL OR :category = '' OR v.categories LIKE %:category%) " +
            "AND (:location IS NULL OR :location = '' OR v.location LIKE %:location%)")
    Page<Video> findByFilters(
            @org.springframework.data.repository.query.Param("status") Video.Status status,
            @org.springframework.data.repository.query.Param("category") String category,
            @org.springframework.data.repository.query.Param("location") String location,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Video v WHERE v.status = 'APPROVED' AND (" +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.tags) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.categories) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Video> searchVideos(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT v.title FROM Video v WHERE v.status = 'APPROVED' AND " +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY v.views DESC")
    List<String> findSuggestions(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);
    @org.springframework.data.jpa.repository.Query("SELECT v FROM Video v WHERE " +
            "LOWER(v.user.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.user.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Video> adminSearchVideos(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);
}
