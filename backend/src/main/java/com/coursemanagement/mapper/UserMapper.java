package com.coursemanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.coursemanagement.model.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT * FROM users WHERE email = #{email}")
    User selectByEmail(String email);
}
