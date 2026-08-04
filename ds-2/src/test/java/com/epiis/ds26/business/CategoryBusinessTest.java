package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.epiis.ds26.dto.request.CategoryRequest;
import com.epiis.ds26.dto.response.CategoryResponse;
import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CategoryRepo;

@ExtendWith(MockitoExtension.class)
class CategoryBusinessTest {

    @Mock
    private CategoryRepo categoryRepo;

    @InjectMocks
    private CategoryBusiness categoryBusiness;

    private EntityCategory category;
    private CategoryRequest request;

    @BeforeEach
    void setUp() {
        category = new EntityCategory();
        category.setIdCategory("cat-1");
        category.setName("Programming");
        category.setDescription("Programming courses");

        request = new CategoryRequest();
        request.setName("Programming");
        request.setDescription("Programming courses");
    }

    @Test
    void insertToCategory_validRequest_success() {
        when(categoryRepo.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(categoryRepo.save(any(EntityCategory.class))).thenReturn(category);

        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
        verify(categoryRepo, times(1)).save(any(EntityCategory.class));
    }

    @ParameterizedTest
    @ValueSource(strings = { "", "12345", "ab" })
    void insertToCategory_invalidName(String invalidName) {
        request.setName(invalidName);
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidName_onlyNumbers() {
        request.setName("12345");
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidName_tooShort() {
        request.setName("ab");
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidName_tooLong() {
        request.setName("a".repeat(51));
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_duplicateName_warning() {
        when(categoryRepo.existsByNameIgnoreCase("Programming")).thenReturn(true);
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidDescription_empty() {
        request.setDescription("");
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidDescription_tooShort() {
        request.setDescription("abcd");
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insertToCategory_invalidDescription_tooLong() {
        request.setDescription("a".repeat(201));
        GenericResponse response = new GenericResponse();
        EntityCategory result = categoryBusiness.insertToCategory(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void deleteCategory_exists_success() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.of(category));

        GenericResponse response = new GenericResponse();
        boolean deleted = categoryBusiness.deleteCategory("cat-1", response);

        assertTrue(deleted);
        assertEquals("success", response.getType());
        verify(categoryRepo, times(1)).delete(category);
    }

    @Test
    void deleteCategory_notExists_warning() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean deleted = categoryBusiness.deleteCategory("cat-1", response);

        assertFalse(deleted);
        assertEquals("warning", response.getType());
    }

    @Test
    void findByIdCategory_exists_returnsResponse() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.of(category));

        CategoryResponse result = categoryBusiness.findByIdCategory("cat-1");

        assertNotNull(result);
        assertEquals("Programming", result.getName());
    }

    @Test
    void findByIdCategory_notExists_returnsNull() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.empty());

        CategoryResponse result = categoryBusiness.findByIdCategory("cat-1");

        assertNull(result);
    }

    @Test
    void updateCategory_exists_success() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.of(category));
        when(categoryRepo.save(any(EntityCategory.class))).thenReturn(category);

        GenericResponse response = new GenericResponse();
        CategoryResponse result = categoryBusiness.updateCategory("cat-1", request, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void updateCategory_notExists_warning() {
        when(categoryRepo.findById("cat-1")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        CategoryResponse result = categoryBusiness.updateCategory("cat-1", request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void findAllCategory_returnsList() {
        when(categoryRepo.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryBusiness.findAllCategory();

        assertEquals(1, result.size());
        assertEquals("Programming", result.get(0).getName());
    }

    @Test
    void searchCategories_noParams_warning() {
        GenericResponse response = new GenericResponse();
        List<CategoryResponse> result = categoryBusiness.searchCategories("", response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }

    @Test
    void searchCategories_found_success() {
        when(categoryRepo.searchByName("Pro")).thenReturn(List.of(category));

        GenericResponse response = new GenericResponse();
        List<CategoryResponse> result = categoryBusiness.searchCategories("Pro", response);

        assertEquals(1, result.size());
        assertEquals("success", response.getType());
    }

    @Test
    void searchCategories_notFound_warning() {
        when(categoryRepo.searchByName("Pro")).thenReturn(Collections.emptyList());

        GenericResponse response = new GenericResponse();
        List<CategoryResponse> result = categoryBusiness.searchCategories("Pro", response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }
}
