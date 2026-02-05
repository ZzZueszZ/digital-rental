package dev.xbase.core.starter.security;

import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Optional;

public interface AuthenticationService {
    Optional<UserDetails> parseOTSIdentity(String otsIdentity) throws IOException;
}
