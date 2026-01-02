package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Category;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> list(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(categoryService.listByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String name = body.get("name");
        Category category = categoryService.createCategory(name, userDetails.getId());
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryService.removeByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
