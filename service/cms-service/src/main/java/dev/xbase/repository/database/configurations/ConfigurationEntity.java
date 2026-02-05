package dev.xbase.repository.database.configurations;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import dev.xbase.core.starter.database.Auditable;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "configurations")
@EqualsAndHashCode(callSuper = false)
public class ConfigurationEntity extends Auditable implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer configurationId;
    @Column(nullable = false)
    private Integer configurationGroupId;
    @Column(nullable = false, unique = true)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String type;
    @Column(nullable = false)
    private String value;
    @Column(nullable = false)
    private Boolean required;
    @Column(nullable = false)
    private String description;
    @Column(nullable = false)
    private String options;
}
