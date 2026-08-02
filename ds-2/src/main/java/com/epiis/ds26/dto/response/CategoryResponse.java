package com.epiis.ds26.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class CategoryResponse {
    private String idCategory;
    private String name;
    private String description;
}
