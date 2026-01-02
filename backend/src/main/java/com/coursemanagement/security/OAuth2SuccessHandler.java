package com.coursemanagement.security;

import com.coursemanagement.mapper.RefreshTokenMapper;
import com.coursemanagement.mapper.UserMapper;
import com.coursemanagement.model.entity.RefreshToken;
import com.coursemanagement.model.entity.User;
import com.coursemanagement.util.CookieUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final CookieUtil cookieUtil;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("avatar_url"); // GitHub
        if (avatarUrl == null) {
            avatarUrl = oAuth2User.getAttribute("picture"); // Google
        }

        // Find or create user
        User user = userMapper.selectByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : (email != null ? email.split("@")[0] : "User"));
            user.setAvatarUrl(avatarUrl);
            user.setProvider(provider);
            Object idAttr = oAuth2User.getAttribute("id");
            user.setProviderId(idAttr != null ? idAttr.toString() : oAuth2User.getName());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.insert(user);
        } else {
            // Update existing user with OAuth info if needed
            if (user.getAvatarUrl() == null && avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
                user.setUpdatedAt(LocalDateTime.now());
                userMapper.updateById(user);
            }
        }

        // Generate tokens
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

        // Set httpOnly cookies
        cookieUtil.addAccessTokenCookie(response, accessToken);
        cookieUtil.addRefreshTokenCookie(response, refreshTokenValue);

        // Redirect to frontend (cookies are already set)
        response.sendRedirect(frontendUrl + "/oauth/callback");
    }
}
