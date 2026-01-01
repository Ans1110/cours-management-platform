package com.coursemanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.coursemanagement.model.entity.Curriculum;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CurriculumMapper extends BaseMapper<Curriculum> {
}
