package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.dto.AuthResponse;
import com.coursemanagement.model.dto.LoginRequest;
import com.coursemanagement.model.dto.RegisterRequest;
import com.coursemanagement.model.entity.User;

public interface UserService extends IService<User> {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(Long userId);

    void revokeRefreshToken(String token);

    User getCurrentUser(Long userId);

    boolean existsByEmail(String email);
}
