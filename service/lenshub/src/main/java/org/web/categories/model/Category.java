package org.web.categories.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.model.BaseAuditEntity;

@Entity
@Table(name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_categories_code", columnNames = "code")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
