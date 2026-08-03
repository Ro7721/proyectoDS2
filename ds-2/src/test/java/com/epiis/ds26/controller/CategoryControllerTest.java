package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.CategoryBusiness;
import com.epiis.ds26.dto.request.CategoryRequest;
import com.epiis.ds26.dto.response.CategoryResponse;
import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryBusiness categoryBusiness;

    @InjectMocks
    private CategoryController categoryController;

    private CategoryRequest request;
    private EntityCategory category;
    private CategoryResponse responseDto;

    @BeforeEach
    void setUp() {
        request = new CategoryRequest();
        category = new EntityCategory();
        responseDto = new CategoryResponse();
    }

    @Test
    void insert_success() {
        when(categoryBusiness.insertToCategory(eq(request), any(GenericResponse.class))).thenReturn(category);
        when(categoryBusiness.mapToResponse(category)).thenReturn(responseDto);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.insert(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responseDto, response.getBody().getData());
    }

    @Test
    void insert_failure() {
        when(categoryBusiness.insertToCategory(eq(request), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.insert(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAll_returnsList() {
        when(categoryBusiness.findAllCategory()).thenReturn(List.of(responseDto));

        ResponseEntity<List<CategoryResponse>> response = categoryController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void searchCategories_success() {
        when(categoryBusiness.searchCategories(eq("Prog"), any(GenericResponse.class))).thenReturn(List.of(responseDto));

        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.searchCategories("Prog");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void searchCategories_failure() {
        when(categoryBusiness.searchCategories(eq("Prog"), any(GenericResponse.class))).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.searchCategories("Prog");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_success() {
        when(categoryBusiness.updateCategory(eq("cat-1"), eq(request), any(GenericResponse.class))).thenReturn(responseDto);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.update("cat-1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseDto, response.getBody().getData());
    }

    @Test
    void update_failure() {
        when(categoryBusiness.updateCategory(eq("cat-1"), eq(request), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.update("cat-1", request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void delete_success() {
        when(categoryBusiness.deleteCategory(eq("cat-1"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<Boolean>> response = categoryController.delete("cat-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().getData());
    }

    @Test
    void delete_failure() {
        when(categoryBusiness.deleteCategory(eq("cat-1"), any(GenericResponse.class))).thenReturn(false);

        ResponseEntity<ApiResponse<Boolean>> response = categoryController.delete("cat-1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().getData());
    }
}
