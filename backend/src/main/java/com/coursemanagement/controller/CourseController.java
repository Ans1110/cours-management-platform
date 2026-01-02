package com.coursemanagement.controller;

import com.coursemanagement.model.dto.CourseRequest;
import com.coursemanagement.model.dto.ProgressRequest;
import com.coursemanagement.model.entity.Course;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> list(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(courseService.listByUserId(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getById(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseService.getByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.ok(course);
    }

    @PostMapping
    public ResponseEntity<Course> create(@Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = mapToCourse(request);
        course.setUserId(userDetails.getId());
        courseService.save(course);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = mapToCourse(request);
        course.setId(id);
        course.setUserId(userDetails.getId());
        courseService.updateByIdAndUserId(course, userDetails.getId());
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        courseService.removeByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<Course> updateProgress(@PathVariable Long id,
            @Valid @RequestBody ProgressRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseService.updateProgress(id, request.getProgress(), userDetails.getId());
        return ResponseEntity.ok(course);
    }

    private Course mapToCourse(CourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setStatus(request.getStatus());
        course.setProgress(request.getProgress());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setCoverUrl(request.getCoverUrl());
        return course;
    }
}
