package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.ResourceNotFoundException;
import com.coursemanagement.mapper.NoteMapper;
import com.coursemanagement.model.entity.Note;
import com.coursemanagement.service.NoteService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteServiceImpl extends ServiceImpl<NoteMapper, Note> implements NoteService {

    @Override
    public List<Note> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<Note>()
                .eq(Note::getUserId, userId)
                .orderByDesc(Note::getCreatedAt));
    }

    @Override
    public List<Note> listByUserIdAndCourseId(Long userId, Long courseId) {
        return list(new LambdaQueryWrapper<Note>()
                .eq(Note::getUserId, userId)
                .eq(Note::getCourseId, courseId)
                .orderByDesc(Note::getCreatedAt));
    }

    @Override
    public Note getByIdAndUserId(Long id, Long userId) {
        Note note = getOne(new LambdaQueryWrapper<Note>()
                .eq(Note::getId, id)
                .eq(Note::getUserId, userId));
        if (note == null) {
            throw new ResourceNotFoundException("Note not found with id: " + id);
        }
        return note;
    }

    @Override
    public void updateByIdAndUserId(Note note, Long userId) {
        Note existing = getByIdAndUserId(note.getId(), userId);
        note.setUserId(existing.getUserId());
        note.setCreatedAt(existing.getCreatedAt());
        note.setUpdatedAt(LocalDateTime.now());
        updateById(note);
    }

    @Override
    public void removeByIdAndUserId(Long id, Long userId) {
        getByIdAndUserId(id, userId); // Verify ownership
        removeById(id);
    }
}
