package dev.xbase.repository.database.users;

import dev.xbase.domain.users.User;
import org.mapstruct.Mapper;
import dev.xbase.core.model.mapper.EntityMapper;

@Mapper(componentModel = "spring")
public interface UsersMapper extends EntityMapper<User, UserEntity> {
}
