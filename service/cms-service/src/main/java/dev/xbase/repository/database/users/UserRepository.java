package dev.xbase.repository.database.users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import dev.xbase.domain.users.UserSearchCriteria;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByUsername(String username);

    @Query(value = """
        SELECT u
        FROM UserEntity u
    """)
    Page<UserEntity> findUserAndPageable(
            @Param("search") UserSearchCriteria search, Pageable paging);
}
