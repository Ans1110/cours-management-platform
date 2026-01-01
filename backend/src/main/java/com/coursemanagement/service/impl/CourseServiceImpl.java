package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.ResourceNotFoundException;
import com.coursemanagement.mapper.CourseMapper;
import com.coursemanagement.model.entity.Course;
import com.coursemanagement.service.CourseService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course> implements CourseService {

    @Override
    public List<Course> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<Course>()
                .eq(Course::getUserId, userId)
                .orderByDesc(Course::getCreatedAt));
    }

    @Override
    public Course getByIdAndUserId(Long id, Long userId) {
        Course course = getOne(new LambdaQueryWrapper<Course>()
                .eq(Course::getId, id)
                .eq(Course::getUserId, userId));
        if (course == null) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        return course;
    }

    @Override
    public void updateByIdAndUserId(Course course, Long userId) {
        Course existing = getByIdAndUserId(course.getId(), userId);
        course.setUserId(existing.getUserId());
        course.setCreatedAt(existing.getCreatedAt());
        course.setUpdatedAt(LocalDateTime.now());
        updateById(course);
    }

    @Override
    public void removeByIdAndUserId(Long id, Long userId) {
        getByIdAndUserId(id, userId); // Verify ownership
        removeById(id);
    }

    @Override
    public Course updateProgress(Long id, Integer progress, Long userId) {
        Course course = getByIdAndUserId(id, userId);
        course.setProgress(progress);
        course.setUpdatedAt(LocalDateTime.now());

        // Auto-update status based on progress
        if (progress == 0) {
            course.setStatus("not_started");
        } else if (progress == 100) {
            course.setStatus("completed");
        } else {
            course.setStatus("in_progress");
        }

        updateById(course);
        return course;
    }
}
