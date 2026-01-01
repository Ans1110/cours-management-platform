package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Course;

import java.util.List;

public interface CourseService extends IService<Course> {

    List<Course> listByUserId(Long userId);

    Course getByIdAndUserId(Long id, Long userId);

    void updateByIdAndUserId(Course course, Long userId);

    void removeByIdAndUserId(Long id, Long userId);

    Course updateProgress(Long id, Integer progress, Long userId);
}
