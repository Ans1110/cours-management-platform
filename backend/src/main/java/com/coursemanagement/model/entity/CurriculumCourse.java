package com.coursemanagement.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("curriculum_courses")
public class CurriculumCourse {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long curriculumId;

    private Long courseId;

    private Integer orderIndex;

    private LocalDateTime createdAt;
}
