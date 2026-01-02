package com.coursemanagement.controller;

import com.coursemanagement.model.dto.AuthResponse;
import com.coursemanagement.model.dto.LoginRequest;
import com.coursemanagement.model.dto.RegisterRequest;
import com.coursemanagement.model.entity.User;
import com.coursemanagement.security.CustomUserDetails;
import com.coursemanagement.service.UserService;
import com.coursemanagement.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = userService.register(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(sanitizeResponse(authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = userService.login(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(sanitizeResponse(authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = cookieUtil.getRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResponse authResponse = userService.refreshToken(refreshToken);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(sanitizeResponse(authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getCurrentUser(userDetails.getId());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .provider(user.getProvider())
                .build();
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletResponse response) {
        if (userDetails != null) {
            userService.logout(userDetails.getId());
        }
        cookieUtil.clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        cookieUtil.addAccessTokenCookie(response, authResponse.getAccessToken());
        cookieUtil.addRefreshTokenCookie(response, authResponse.getRefreshToken());
    }

    /**
     * Remove tokens from response body - they're now in httpOnly cookies
     */
    private AuthResponse sanitizeResponse(AuthResponse response) {
        return AuthResponse.builder()
                .tokenType(response.getTokenType())
                .expiresIn(response.getExpiresIn())
                .user(response.getUser())
                .build();
    }
}
