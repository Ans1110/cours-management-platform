package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.BadRequestException;
import com.coursemanagement.exception.ResourceNotFoundException;
import com.coursemanagement.mapper.CurriculumCourseMapper;
import com.coursemanagement.mapper.CurriculumMapper;
import com.coursemanagement.model.entity.Curriculum;
import com.coursemanagement.model.entity.CurriculumCourse;
import com.coursemanagement.service.CurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl extends ServiceImpl<CurriculumMapper, Curriculum> implements CurriculumService {

    private final CurriculumCourseMapper curriculumCourseMapper;

    @Override
    public List<Curriculum> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<Curriculum>()
                .eq(Curriculum::getUserId, userId)
                .orderByDesc(Curriculum::getCreatedAt));
    }

    @Override
    public Curriculum getByIdAndUserId(Long id, Long userId) {
        Curriculum curriculum = getOne(new LambdaQueryWrapper<Curriculum>()
                .eq(Curriculum::getId, id)
                .eq(Curriculum::getUserId, userId));
        if (curriculum == null) {
            throw new ResourceNotFoundException("Curriculum not found with id: " + id);
        }
        return curriculum;
    }

    @Override
    public void updateByIdAndUserId(Curriculum curriculum, Long userId) {
        Curriculum existing = getByIdAndUserId(curriculum.getId(), userId);
        curriculum.setUserId(existing.getUserId());
        curriculum.setCreatedAt(existing.getCreatedAt());
        curriculum.setUpdatedAt(LocalDateTime.now());
        updateById(curriculum);
    }

    @Override
    public void removeByIdAndUserId(Long id, Long userId) {
        getByIdAndUserId(id, userId); // Verify ownership
        // Cascade delete is handled by database FK
        removeById(id);
    }

    @Override
    @Transactional
    public void addCourse(Long curriculumId, Long courseId, Long userId) {
        getByIdAndUserId(curriculumId, userId); // Verify ownership

        // Check if already exists
        CurriculumCourse existing = curriculumCourseMapper.selectOne(
                new LambdaQueryWrapper<CurriculumCourse>()
                        .eq(CurriculumCourse::getCurriculumId, curriculumId)
                        .eq(CurriculumCourse::getCourseId, courseId));

        if (existing != null) {
            throw new BadRequestException("Course already in curriculum");
        }

        // Get max order index
        Long maxOrder = curriculumCourseMapper.selectCount(
                new LambdaQueryWrapper<CurriculumCourse>()
                        .eq(CurriculumCourse::getCurriculumId, curriculumId));

        CurriculumCourse cc = new CurriculumCourse();
        cc.setCurriculumId(curriculumId);
        cc.setCourseId(courseId);
        cc.setOrderIndex(maxOrder.intValue());
        cc.setCreatedAt(LocalDateTime.now());
        curriculumCourseMapper.insert(cc);
    }

    @Override
    @Transactional
    public void removeCourse(Long curriculumId, Long courseId, Long userId) {
        getByIdAndUserId(curriculumId, userId); // Verify ownership

        curriculumCourseMapper.delete(
                new LambdaQueryWrapper<CurriculumCourse>()
                        .eq(CurriculumCourse::getCurriculumId, curriculumId)
                        .eq(CurriculumCourse::getCourseId, courseId));
    }

    @Override
    @Transactional
    public void reorderCourses(Long curriculumId, List<Long> courseIds, Long userId) {
        getByIdAndUserId(curriculumId, userId); // Verify ownership

        for (int i = 0; i < courseIds.size(); i++) {
            CurriculumCourse cc = curriculumCourseMapper.selectOne(
                    new LambdaQueryWrapper<CurriculumCourse>()
                            .eq(CurriculumCourse::getCurriculumId, curriculumId)
                            .eq(CurriculumCourse::getCourseId, courseIds.get(i)));
            if (cc != null) {
                cc.setOrderIndex(i);
                curriculumCourseMapper.updateById(cc);
            }
        }
    }
}
