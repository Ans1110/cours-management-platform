package com.coursemanagement.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String email;

    private String password;

    private String name;

    private String avatarUrl;

    private String provider;

    private String providerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
