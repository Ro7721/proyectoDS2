package com.epiis.DS26.business;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.epiis.DS26.dto.request.CategoryRequest;
import com.epiis.DS26.dto.response.CategoryResponse;
import com.epiis.DS26.entity.EntityCategory;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.CategoryRepo;

import jakarta.transaction.Transactional;

@Service
public class CategoryBusiness {
    private final CategoryRepo categoryRepo;

    public CategoryBusiness(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @Transactional
    public EntityCategory insertToCategory(CategoryRequest request, GenericResponse genericResponse) {
        EntityCategory entity = new EntityCategory();
        entity.setIdCategory(UUID.randomUUID().toString());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());

        if (!validateCategory(request.getName(), request.getDescription(), genericResponse)) {
            return null;
        }
        genericResponse.success();
        genericResponse.listMessage.add("Categoría creada exitosamente");
        return categoryRepo.save(entity);
    }

    // esta es la parte de validacón de categoria
    private boolean validateCategory(String name, String description, GenericResponse genericResponse) {
        if (name == null || name.trim().isEmpty()) {
            genericResponse.warning();
            genericResponse.listMessage.add("El nombre de la categoría es requerido");
            return false;
        }
        if (description == null || description.trim().isEmpty()) {
            genericResponse.warning();
            genericResponse.listMessage.add("La descripción de la categoría es requerida");
            return false;
        }
        return true;
    }

    @Transactional
    public boolean deleteCategory(String id, GenericResponse genericResponse) {
        Optional<EntityCategory> entity = categoryRepo.findById(id);
        if (entity.isPresent()) {
            categoryRepo.delete(entity.get());
            genericResponse.success();
            genericResponse.listMessage.add("Categoría eliminada exitosamente");
            return true;
        }
        genericResponse.warning();
        genericResponse.listMessage.add("Categoría no encontrada");
        return false;
    }

    public CategoryResponse mapToResponse(EntityCategory entity) {
        CategoryResponse response = new CategoryResponse();
        response.setIdCategory(entity.getIdCategory());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        return response;
    }

    public CategoryResponse findByIdCategory(String id) {
        Optional<EntityCategory> entity = categoryRepo.findById(id);
        if (entity.isPresent()) {
            return mapToResponse(entity.get());
        }
        return null;
    }

    @Transactional
    public CategoryResponse updateCategory(String id, CategoryRequest request, GenericResponse genericResponse) {
        Optional<EntityCategory> entity = categoryRepo.findById(id);
        if (entity.isPresent()) {
            entity.get().setName(request.getName());
            entity.get().setDescription(request.getDescription());
            genericResponse.success();
            genericResponse.listMessage.add("Categoría actualizada exitosamente");
            return mapToResponse(categoryRepo.save(entity.get()));
        }
        genericResponse.warning();
        genericResponse.listMessage.add("Categoría no encontrada");
        return null;
    }

    public List<CategoryResponse> findAllCategory() {
        return categoryRepo.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CategoryResponse> searchCategories(String name, GenericResponse response) {
        boolean hasParams = false;

        String nameParam = null;
        if (name != null && !name.trim().isEmpty()) {
            nameParam = name.trim();
            hasParams = true;
        }

        if (!hasParams) {
            response.warning();
            response.listMessage.add("Por favor proporcione al menos un parámetro de búsqueda");
            return java.util.Collections.emptyList();
        }

        List<CategoryResponse> result = categoryRepo.searchByName(nameParam)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        if (result.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron categorías con los criterios proporcionados");
        } else {
            response.success();
            response.listMessage.add("Búsqueda exitosa");
        }

        return result;
    }
}
