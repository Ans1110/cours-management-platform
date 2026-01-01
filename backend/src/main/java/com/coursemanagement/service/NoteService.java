package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Note;

import java.util.List;

public interface NoteService extends IService<Note> {

    List<Note> listByUserId(Long userId);

    List<Note> listByUserIdAndCourseId(Long userId, Long courseId);

    Note getByIdAndUserId(Long id, Long userId);

    void updateByIdAndUserId(Note note, Long userId);

    void removeByIdAndUserId(Long id, Long userId);
}
