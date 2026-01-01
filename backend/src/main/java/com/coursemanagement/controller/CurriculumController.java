package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Curriculum;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.CurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/curriculums")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;

    @GetMapping
    public ResponseEntity<List<Curriculum>> list(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(curriculumService.listByUserId(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curriculum> getById(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Curriculum curriculum = curriculumService.getByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.ok(curriculum);
    }

    @PostMapping
    public ResponseEntity<Curriculum> create(@RequestBody Curriculum curriculum,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        curriculum.setUserId(userDetails.getId());
        curriculumService.save(curriculum);
        return ResponseEntity.ok(curriculum);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Curriculum> update(@PathVariable Long id,
            @RequestBody Curriculum curriculum,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        curriculum.setId(id);
        curriculumService.updateByIdAndUserId(curriculum, userDetails.getId());
        return ResponseEntity.ok(curriculum);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        curriculumService.removeByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/courses/{courseId}")
    public ResponseEntity<Void> addCourse(@PathVariable Long id,
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        curriculumService.addCourse(id, courseId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    public ResponseEntity<Void> removeCourse(@PathVariable Long id,
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        curriculumService.removeCourse(id, courseId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/courses/order")
    public ResponseEntity<Void> reorderCourses(@PathVariable Long id,
            @RequestBody Map<String, List<Long>> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Long> courseIds = body.get("courseIds");
        curriculumService.reorderCourses(id, courseIds, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
