package com.epiis.DS26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.DS26.business.CategoryBusiness;
import com.epiis.DS26.dto.request.CategoryRequest;
import com.epiis.DS26.dto.response.CategoryResponse;
import com.epiis.DS26.entity.EntityCategory;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;

@RestController
@RequestMapping(path = "categories")

public class CategoryController {

    private final CategoryBusiness categoryBusiness;

    public CategoryController(CategoryBusiness categoryBusiness) {
        this.categoryBusiness = categoryBusiness;
    }

    @PostMapping(path = "insert", consumes = { MediaType.APPLICATION_JSON_VALUE }, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CategoryResponse>> insert(@RequestBody CategoryRequest request) {
        GenericResponse response = new GenericResponse();
        EntityCategory category = categoryBusiness.insertToCategory(request, response);
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (category != null) {
            apiResponse.setData(categoryBusiness.mapToResponse(category));
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "list", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<CategoryResponse>> getAll() {
        List<CategoryResponse> list = categoryBusiness.findAllCategory();
        return ResponseEntity.ok(list);
    }

    @GetMapping(path = "search/{value}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> searchCategories(@PathVariable String value) {
        GenericResponse response = new GenericResponse();
        List<CategoryResponse> list = categoryBusiness.searchCategories(value, response);

        ApiResponse<List<CategoryResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(list);

        if (list == null || list.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping(path = "update/{idCategory}", consumes = { MediaType.APPLICATION_JSON_VALUE }, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CategoryResponse>> update(@PathVariable String idCategory, @RequestBody CategoryRequest request) {
        GenericResponse response = new GenericResponse();
        CategoryResponse category = categoryBusiness.updateCategory(idCategory, request, response);
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (category != null) {
            apiResponse.setData(category);
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @DeleteMapping(path = "delete/{idCategory}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<Boolean>> delete(@PathVariable String idCategory) {
        GenericResponse response = new GenericResponse();
        boolean deleted = categoryBusiness.deleteCategory(idCategory, response);
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(deleted);
        if (deleted) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
