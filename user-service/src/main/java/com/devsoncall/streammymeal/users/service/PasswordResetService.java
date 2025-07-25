package com.devsoncall.streammymeal.users.service;

import com.devsoncall.streammymeal.users.client.NotificationClient;
import com.devsoncall.streammymeal.users.dto.resetPassword.ForgotPasswordRequest;
import com.devsoncall.streammymeal.users.dto.resetPassword.PasswordResetResponse;
import com.devsoncall.streammymeal.users.dto.resetPassword.ResetPasswordRequest;
import com.devsoncall.streammymeal.users.entity.PasswordResetToken;
import com.devsoncall.streammymeal.users.entity.User;
import com.devsoncall.streammymeal.users.exception.InvalidTokenException;
import com.devsoncall.streammymeal.users.exception.TokenAlreadyUsedException;
import com.devsoncall.streammymeal.users.exception.TokenExpiredException;
import com.devsoncall.streammymeal.users.repository.PasswordResetTokenRepo;
import com.devsoncall.streammymeal.users.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final UserRepository userRepository;
    private final NotificationClient notificationClient;
    private final PasswordEncoder passwordEncoder;

    // initiate password reset
    public PasswordResetResponse initiatePasswordReset(ForgotPasswordRequest request) {
        try{
            User user = userRepository.findByEmailAndIsActiveTrue(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = UUID.randomUUID().toString();
            // Create or update token
            PasswordResetToken resetToken = passwordResetTokenRepo.findByUser(user)
                    .orElseGet(() -> new PasswordResetToken(user, token));

            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            resetToken.setUsed(false);

            passwordResetTokenRepo.save(resetToken);  // Save token

            // Send email
            notificationClient.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());

            return new PasswordResetResponse("Password reset instructions have been sent to your email", true);
        } catch (Exception e) {
            log.error("Failed to process password reset for email: {}", request.getEmail(), e);
            return new PasswordResetResponse(
                    e.getMessage(),
                    false
            );
        }
    }

    // reset password
    public PasswordResetResponse resetPassword(ResetPasswordRequest request) {
        try {
            PasswordResetToken resetToken = passwordResetTokenRepo.findByToken(request.getToken())
                    .orElseThrow(() -> new InvalidTokenException("Invalid reset token. Try again !"));

            validateToken(resetToken);

            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));

            // Mark token as used
            resetToken.setUsed(true);

            userRepository.save(user);
            passwordResetTokenRepo.save(resetToken);

            log.info("Password successfully reset for user: {}", user.getEmail());

            return new PasswordResetResponse("Password has been reset successfully", true);
        } catch (InvalidTokenException | TokenExpiredException e) {
            log.warn("Invalid password reset attempt: {}", e.getMessage());
            return new PasswordResetResponse(e.getMessage(), false);
        } catch (Exception e) {
            log.error("Error during password reset", e);
            return new PasswordResetResponse(e.getMessage(), false);
        }
    }

    private void validateToken(PasswordResetToken token) {
        if (token.isExpired()) {
            throw new TokenExpiredException("Reset token has expired . Try again !");
        }
        if (token.isUsed()) {
            throw new TokenAlreadyUsedException("Reset token has already been used");
        }
    }


}
