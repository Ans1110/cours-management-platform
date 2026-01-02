package com.coursemanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.coursemanagement.model.entity.RefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface RefreshTokenMapper extends BaseMapper<RefreshToken> {

    @Select("SELECT * FROM refresh_tokens WHERE token = #{token} AND revoked = false AND expires_at > NOW()")
    RefreshToken findValidToken(@Param("token") String token);

    @Update("UPDATE refresh_tokens SET revoked = true WHERE user_id = #{userId}")
    void revokeAllUserTokens(@Param("userId") Long userId);

    @Update("UPDATE refresh_tokens SET revoked = true WHERE token = #{token}")
    void revokeToken(@Param("token") String token);
}
