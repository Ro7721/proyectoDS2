package com.epiis.DS26.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "tcategory")
@Getter
@Setter
public class EntityCategory {
    @Id
    @Column(name = "idCategory")
    private String idCategory;
    @Column(name = "name")
    private String name;
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "category")
    private List<EntityCourse> courses;
}
