package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Curriculum;

import java.util.List;

public interface CurriculumService extends IService<Curriculum> {

    List<Curriculum> listByUserId(Long userId);

    Curriculum getByIdAndUserId(Long id, Long userId);

    void updateByIdAndUserId(Curriculum curriculum, Long userId);

    void removeByIdAndUserId(Long id, Long userId);

    void addCourse(Long curriculumId, Long courseId, Long userId);

    void removeCourse(Long curriculumId, Long courseId, Long userId);

    void reorderCourses(Long curriculumId, List<Long> courseIds, Long userId);
}
