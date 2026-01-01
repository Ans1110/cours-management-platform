package com.coursemanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.coursemanagement.model.entity.Note;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NoteMapper extends BaseMapper<Note> {
}
