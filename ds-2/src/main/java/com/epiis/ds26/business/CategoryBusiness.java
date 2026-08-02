package com.epiis.ds26.business;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.epiis.ds26.dto.request.CategoryRequest;
import com.epiis.ds26.dto.response.CategoryResponse;
import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CategoryRepo;

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
        genericResponse.listMessage.add("CategorÃ­a creada exitosamente");
        return categoryRepo.save(entity);
    }

    // esta es la parte de validacÃ³n de categoria
    private boolean validateCategory(String name, String description, GenericResponse genericResponse) {
        if (name == null || name.trim().isEmpty()) {
            genericResponse.warning();
            genericResponse.listMessage.add("El nombre de la categorÃ­a es requerido");
            return false;
        }
        if (name.trim().matches("^\\d+$")) {
            genericResponse.warning();
            genericResponse.listMessage.add("El nombre no puede ser solo nÃºmeros");
            return false;
        }
        if (name.trim().length() < 3) {
            genericResponse.warning();
            genericResponse.listMessage.add("El nombre debe tener al menos 3 caracteres");
            return false;
        }
        if (name.trim().length() > 50) {
            genericResponse.warning();
            genericResponse.listMessage.add("El nombre no puede exceder los 50 caracteres");
            return false;
        }
        if (categoryRepo.existsByNameIgnoreCase(name.trim())) {
            genericResponse.warning();
            genericResponse.listMessage.add("Ya existe una categorÃ­a con ese nombre");
            return false;
        }
        if (description == null || description.trim().isEmpty()) {
            genericResponse.warning();
            genericResponse.listMessage.add("La descripciÃ³n de la categorÃ­a es requerida");
            return false;
        }
        if (description.trim().length() < 5) {
            genericResponse.warning();
            genericResponse.listMessage.add("La descripciÃ³n debe tener al menos 5 caracteres");
            return false;
        }
        if (description.trim().length() > 200) {
            genericResponse.warning();
            genericResponse.listMessage.add("La descripciÃ³n no puede exceder los 200 caracteres");
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
            genericResponse.listMessage.add("CategorÃ­a eliminada exitosamente");
            return true;
        }
        genericResponse.warning();
        genericResponse.listMessage.add("CategorÃ­a no encontrada");
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
            genericResponse.listMessage.add("CategorÃ­a actualizada exitosamente");
            return mapToResponse(categoryRepo.save(entity.get()));
        }
        genericResponse.warning();
        genericResponse.listMessage.add("CategorÃ­a no encontrada");
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
            response.listMessage.add("Por favor proporcione al menos un parÃ¡metro de bÃºsqueda");
            return java.util.Collections.emptyList();
        }

        List<CategoryResponse> result = categoryRepo.searchByName(nameParam)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        if (result.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron categorÃ­as con los criterios proporcionados");
        } else {
            response.success();
            response.listMessage.add("BÃºsqueda exitosa");
        }

        return result;
    }
}
