package com.coursemanagement.controller;

import com.coursemanagement.model.entity.Attachment;
import com.coursemanagement.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final AttachmentService attachmentService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("noteId") Long noteId) throws IOException {

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        // Create attachment record
        Attachment attachment = new Attachment();
        attachment.setNoteId(noteId);
        attachment.setFileName(originalFilename);
        attachment.setFileType(file.getContentType());
        attachment.setFileUrl("/uploads/" + uniqueFilename);
        attachment.setFileSize(file.getSize());
        attachment.setCreatedAt(LocalDateTime.now());

        attachmentService.save(attachment);

        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<Attachment>> getByNoteId(@PathVariable Long noteId) {
        List<Attachment> attachments = attachmentService.listByNoteId(noteId);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Attachment attachment = attachmentService.getById(id);
        if (attachment != null) {
            // Delete file from disk
            try {
                Path filePath = Paths.get(uploadDir, attachment.getFileUrl().replace("/uploads/", ""));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but continue with DB deletion
            }
            attachmentService.removeById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
