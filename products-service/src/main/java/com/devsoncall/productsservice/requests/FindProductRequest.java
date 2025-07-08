package com.devsoncall.productsservice.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
public class FindProductRequest {

    @Getter
    @Setter
    Integer id;

    @Getter
    @Setter
    Integer categoryId;

    @Getter
    @Setter
    Integer subCategoryId;

}
