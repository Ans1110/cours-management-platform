package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.mapper.AttachmentMapper;
import com.coursemanagement.model.entity.Attachment;
import com.coursemanagement.service.AttachmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttachmentServiceImpl extends ServiceImpl<AttachmentMapper, Attachment> implements AttachmentService {

    @Override
    public List<Attachment> listByNoteId(Long noteId) {
        return list(new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getNoteId, noteId)
                .orderByDesc(Attachment::getCreatedAt));
    }

    @Override
    public void removeByNoteId(Long noteId) {
        remove(new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getNoteId, noteId));
    }
}
