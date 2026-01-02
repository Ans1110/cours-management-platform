package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Attachment;

import java.util.List;

public interface AttachmentService extends IService<Attachment> {
    List<Attachment> listByNoteId(Long noteId);

    void removeByNoteId(Long noteId);
}
