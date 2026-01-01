package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Todo;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<List<Todo>> list(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status) {
        List<Todo> todos;
        if (status != null) {
            todos = todoService.listByUserIdAndStatus(userDetails.getId(), status);
        } else {
            todos = todoService.listByUserId(userDetails.getId());
        }
        return ResponseEntity.ok(todos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Todo> getById(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Todo todo = todoService.getByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.ok(todo);
    }

    @PostMapping
    public ResponseEntity<Todo> create(@RequestBody Todo todo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        todo.setUserId(userDetails.getId());
        todoService.save(todo);
        return ResponseEntity.ok(todo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(@PathVariable Long id,
            @RequestBody Todo todo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        todo.setId(id);
        todoService.updateByIdAndUserId(todo, userDetails.getId());
        return ResponseEntity.ok(todo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        todoService.removeByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Todo> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String status = body.get("status");
        Todo todo = todoService.updateStatus(id, status, userDetails.getId());
        return ResponseEntity.ok(todo);
    }
}
