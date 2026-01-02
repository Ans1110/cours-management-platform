package com.coursemanagement.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TodoRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Pattern(regexp = "^(low|medium|high)$", message = "Priority must be low, medium, or high")
    private String priority = "medium";

    @Pattern(regexp = "^(pending|in_progress|completed)$", message = "Status must be pending, in_progress, or completed")
    private String status = "pending";

    private LocalDate dueDate;

    private Long courseId;
}
