package com.coursemanagement.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("attachments")
public class Attachment {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long noteId;

    private String fileName;

    private String fileType;

    private String fileUrl;

    private Long fileSize;

    private String linkUrl;

    private LocalDateTime createdAt;
}
