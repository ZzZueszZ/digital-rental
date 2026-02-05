package dev.xbase.repository.database.configurations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfigurationRepository extends JpaRepository<ConfigurationEntity, Integer> {

    @Query(value = """
        SELECT c
        FROM ConfigurationEntity c
        INNER JOIN ConfigurationGroupEntity cg ON c.configurationGroupId = cg.configurationGroupId
        WHERE cg.code = :groupCode
    """)
    List<ConfigurationEntity> findAllByGroup(String groupCode);
}
