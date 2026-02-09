package com.videosharing.repository;

import com.videosharing.model.entity.ImageNews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageNewsRepository extends JpaRepository<ImageNews, Long> {
    List<ImageNews> findByStatus(ImageNews.Status status);

    @Query("SELECT i FROM ImageNews i WHERE (:status IS NULL OR i.status = :status) AND " +
            "(:location IS NULL OR :location = '' OR i.location = :location)")
    Page<ImageNews> findByFilters(ImageNews.Status status, String location, Pageable pageable);
}
