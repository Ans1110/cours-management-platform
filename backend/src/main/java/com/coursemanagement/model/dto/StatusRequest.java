package com.coursemanagement.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(pending|in_progress|completed)$", message = "Status must be pending, in_progress, or completed")
    private String status;
}
