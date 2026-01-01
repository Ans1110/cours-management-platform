package com.coursemanagement.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("courses")
public class Course {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String description;

    private String category;

    private String status;

    private Integer progress;

    private LocalDate startDate;

    private LocalDate endDate;

    private String coverUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
