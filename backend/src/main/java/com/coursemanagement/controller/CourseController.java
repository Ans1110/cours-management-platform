package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Course;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<Course> create(@RequestBody Course course,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        course.setUserId(userDetails.getId());
        courseService.save(course);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id,
            @RequestBody Course course,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
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
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer progress = body.get("progress");
        Course course = courseService.updateProgress(id, progress, userDetails.getId());
        return ResponseEntity.ok(course);
    }
}
