package dev.xbase.configurations.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import dev.xbase.domain.users.User;

import java.util.ArrayList;
import java.util.Collection;

public record UserAuthentication(@NonNull User user) implements UserDetails {
    @Override
    public String getUsername() {
        return user.username();
    }

    @JsonIgnore
    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return new ArrayList<>();
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return user.password();
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
