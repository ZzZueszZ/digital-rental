package dev.xbase.repository.database.configurations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigurationGroupRepository extends JpaRepository<ConfigurationGroupEntity, Integer> {

}
