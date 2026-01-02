package com.coursemanagement.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("categories")
public class Category {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String name;

    private LocalDateTime createdAt;
}
