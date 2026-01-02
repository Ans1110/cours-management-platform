package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.BadRequestException;
import com.coursemanagement.mapper.RefreshTokenMapper;
import com.coursemanagement.mapper.UserMapper;
import com.coursemanagement.model.dto.AuthResponse;
import com.coursemanagement.model.dto.LoginRequest;
import com.coursemanagement.model.dto.RegisterRequest;
import com.coursemanagement.model.entity.RefreshToken;
import com.coursemanagement.model.entity.User;
import com.coursemanagement.security.JwtTokenProvider;
import com.coursemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setProvider("local");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userMapper.insert(user);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userMapper.selectByEmail(request.getEmail());

        if (user == null) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        // Validate token exists in database and is not revoked
        RefreshToken storedToken = refreshTokenMapper.findValidToken(refreshToken);
        if (storedToken == null) {
            throw new BadRequestException("Refresh token has been revoked or expired");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userMapper.selectById(userId);

        if (user == null) {
            throw new BadRequestException("User not found");
        }

        // Revoke old refresh token (rotation)
        refreshTokenMapper.revokeToken(refreshToken);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        // Revoke all refresh tokens for the user
        refreshTokenMapper.revokeAllUserTokens(userId);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenMapper.revokeToken(token);
    }

    @Override
    public User getCurrentUser(Long userId) {
        return userMapper.selectById(userId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.selectByEmail(email) != null;
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenValue = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        // Store refresh token in database
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000));
        refreshToken.setRevoked(false);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenMapper.insert(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .avatarUrl(user.getAvatarUrl())
                        .provider(user.getProvider())
                        .build())
                .build();
    }
}
