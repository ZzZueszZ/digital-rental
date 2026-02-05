package dev.xbase.controller.api.users;

import dev.xbase.controller.api.users.models.UserResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import dev.xbase.controller.api.users.models.UserRequest;
import dev.xbase.core.model.PageImplResponse;
import dev.xbase.core.model.ValueResponse;

@RequestMapping("/v1/api/users")
public interface UsersAPI {
    @GetMapping
    PageImplResponse<UserResponse> users(
            @RequestParam(required = false, value = "status[]") String[] status,
            @RequestParam(required = false, value = "userName", defaultValue = "") String userName,
            @RequestParam(required = false, value = "email", defaultValue = "") String email,
            @RequestParam(required = false, value = "timeZone", defaultValue = "0") Integer timeZone,
            @RequestParam(required = false, value = "current", defaultValue = "1") Integer currentPage,
            @RequestParam(required = false, value = "pageSize", defaultValue = "20") Integer pageSize);

    @GetMapping("findBy")
    ValueResponse<UserResponse> findBy(@RequestParam("userId") Integer userId);

    @DeleteMapping
    void delete(@RequestParam("id") Integer id);

    @PostMapping
    void save(@Valid @RequestBody UserRequest userRequest);
}
