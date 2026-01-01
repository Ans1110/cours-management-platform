package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Course;
import com.coursemanagement.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> list() {
        return ResponseEntity.ok(courseService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Course> create(@RequestBody Course course) {
        courseService.save(course);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id, @RequestBody Course course) {
        course.setId(id);
        courseService.updateById(course);
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.removeById(id);
        return ResponseEntity.noContent().build();
    }
}
