package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Note;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<Note>> list(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long courseId) {
        List<Note> notes;
        if (courseId != null) {
            notes = noteService.listByUserIdAndCourseId(userDetails.getId(), courseId);
        } else {
            notes = noteService.listByUserId(userDetails.getId());
        }
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getById(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Note note = noteService.getByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<Note> create(@RequestBody Note note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        note.setUserId(userDetails.getId());
        LocalDateTime now = LocalDateTime.now();
        note.setCreatedAt(now);
        note.setUpdatedAt(now);
        noteService.save(note);
        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> update(@PathVariable Long id,
            @RequestBody Note note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        note.setId(id);
        noteService.updateByIdAndUserId(note, userDetails.getId());
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        noteService.removeByIdAndUserId(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
