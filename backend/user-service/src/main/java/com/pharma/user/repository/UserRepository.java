package com.pharma.user.repository;

import com.pharma.user.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }

    public Optional<User> findByMobile(String mobile) {
        return find("mobile", mobile).firstResultOptional();
    }

    public Optional<User> findByEmailOrMobile(String emailOrMobile) {
        return find("email = ?1 or mobile = ?1", emailOrMobile).firstResultOptional();
    }

    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }

    public boolean existsByMobile(String mobile) {
        return count("mobile", mobile) > 0;
    }
}
