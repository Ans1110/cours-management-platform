package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.mapper.CourseMapper;
import com.coursemanagement.model.entity.Course;
import com.coursemanagement.service.CourseService;
import org.springframework.stereotype.Service;

@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course> implements CourseService {
}
