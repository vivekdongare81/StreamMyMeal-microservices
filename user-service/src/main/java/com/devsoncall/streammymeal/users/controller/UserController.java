package com.devsoncall.streammymeal.users.controller;

import com.devsoncall.streammymeal.users.dto.ProfileResponse;
import com.devsoncall.streammymeal.users.dto.ProfileUpdateDTO;
import com.devsoncall.streammymeal.users.dto.UserDTO;
import com.devsoncall.streammymeal.users.entity.User;
import com.devsoncall.streammymeal.users.service.FileStorageService;
import com.devsoncall.streammymeal.users.service.ProfileService;
import com.devsoncall.streammymeal.users.service.UserService;

import org.springframework.core.io.Resource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final ProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        ProfileResponse profile = profileService.getProfile(user.getUserId());
        System.out.println("DEBUG ProfileResponse: " + profile);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestPart("profile") ProfileUpdateDTO profileDTO,
            @RequestPart(value = "image", required = false) MultipartFile profileImage) {

        Optional.ofNullable(profileImage).ifPresent(this::validateImage);

        return ResponseEntity.ok(profileService.updateProfile(user.getUserId(), profileDTO, profileImage));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Integer userId) {
        userService.deleteUserById(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile/image/{fileName:.+}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(resource);
    }

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload");
        }

        if (!Optional.ofNullable(file.getContentType()).filter(type -> type.startsWith("image/")).isPresent()) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers (
            @RequestParam(defaultValue = "false") boolean includeInactive, @RequestParam int page, @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> users = includeInactive ?
                userService.getAllUsers(pageable) :
                userService.getAllActiveUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.create(userDTO);
        return ResponseEntity
                .created(URI.create("/api/users/" + createdUser.getUserId()))
                .body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UserDTO userDTO,
            @AuthenticationPrincipal User authUser) {
        try {
            // If admin, allow full update
            if (authUser.getRoles().contains("ROLE_ADMIN")) {
                return ResponseEntity.ok(userService.updateUser(id, userDTO));
            }
            // If not admin, only allow updating own address
            if (!authUser.getUserId().equals(id)) {
                return ResponseEntity.status(403).body("You can only update your own profile");
            }
            // Only update address
            UserDTO existing = userService.getUserById(id);
            existing.setAddress(userDTO.getAddress());
            UserDTO updated = userService.updateUser(id, existing);
            // Optionally, return ProfileResponse for consistency
            ProfileResponse profile = ProfileResponse.builder()
                .userId(updated.getUserId())
                .username(updated.getUsername())
                .email(updated.getEmail())
                .address(updated.getAddress())
                .profileImageUrl(null) // set if needed
                .build();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            return ResponseEntity.status(400).body("Failed to update user: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Integer id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> reactivateUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.reactivateUser(id));
    }

}
