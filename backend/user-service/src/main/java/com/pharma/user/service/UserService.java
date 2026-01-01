package com.pharma.user.service;

import com.pharma.user.dto.UserDTO;
import com.pharma.user.entity.User;
import com.pharma.user.exception.UserNotFoundException;
import com.pharma.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    public User getById(Long id) {
        return userRepository.findByIdOptional(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Transactional
    public User update(User user) {
        return userRepository.getEntityManager().merge(user);
    }

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setMobile(user.getMobile());
        dto.setRole(user.getRole());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setMobileVerified(user.getMobileVerified());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }
}
