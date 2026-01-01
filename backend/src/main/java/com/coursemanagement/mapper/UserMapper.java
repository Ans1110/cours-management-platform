package com.coursemanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.coursemanagement.model.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
