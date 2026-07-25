package com.epiis.DS26.business;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.epiis.DS26.dto.request.CourseRequest;
import com.epiis.DS26.dto.response.CourseCardResponse;
import com.epiis.DS26.dto.response.CourseResponse;
import com.epiis.DS26.dto.response.LessonFileResponse;
import com.epiis.DS26.dto.response.LessonResponse;
import com.epiis.DS26.entity.EntityCategory;
import com.epiis.DS26.entity.EntityCourse;
import com.epiis.DS26.entity.EntityLesson;
import com.epiis.DS26.entity.EntityLessonFile;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.enums.ELevel;
import com.epiis.DS26.enums.EStatus;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.CourseRepo;
import com.epiis.DS26.repositorie.LessonFileRepo;
import com.epiis.DS26.repositorie.LessonRepo;

import jakarta.transaction.Transactional;

@Service
public class CourseBusiness {

    private final CourseRepo courseRepo;
    private final LessonRepo lessonRepo;
    private final LessonFileRepo lessonFileRepo;

    @Value("${app.base-url}")
    private String baseUrl;
    @Value("${app.storage.path}")
    private String storagePath;

    public CourseBusiness(CourseRepo courseRepo, LessonRepo lessonRepo, LessonFileRepo lessonFileRepo) {
        this.courseRepo = courseRepo;
        this.lessonRepo = lessonRepo;
        this.lessonFileRepo = lessonFileRepo;
    }

    private EntityCourse mapToEntity(CourseRequest request) {
        EntityCourse entity = new EntityCourse();

        entity.setIdCourse(UUID.randomUUID().toString());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        String fileName = saveImage(request.getCoverImage());
        entity.setCoverImage(fileName);
        entity.setLevel(ELevel.valueOf(request.getLevel()));
        entity.setPrice(request.getPrice());
        entity.setStatus(EStatus.valueOf(request.getStatus()));

        if (request.getIdTeacher() != null) {
            EntityUser teacher = new EntityUser();
            teacher.setIdUser(request.getIdTeacher());
            entity.setTeacher(teacher);
        }

        if (request.getIdCategory() != null) {
            EntityCategory category = new EntityCategory();
            category.setIdCategory(request.getIdCategory());
            entity.setCategory(category);
        }
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(entity.getCreatedAt());

        return entity;
    }

    public CourseResponse mapToResponse(EntityCourse entity) {
        CourseResponse response = new CourseResponse();
        response.setIdCourse(entity.getIdCourse());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setCoverImage(baseUrl + "/course-images/" + entity.getCoverImage());
        response.setLevel(entity.getLevel().toString());
        response.setPrice(entity.getPrice());
        response.setTeacherFullName(entity.getTeacher().getFirstName() + " " + entity.getTeacher().getLastName());
        response.setStatus(entity.getStatus().toString());
        response.setCategoryName(entity.getCategory().getName());
        response.setCreatedAt(entity.getCreatedAt());
        response.setTotalLessons(entity.getLessons() != null ? entity.getLessons().size() : 0);
        if (entity.getLessons() != null) {
            response.setLessons(
                    entity.getLessons().stream().map(this::mapToLessonResponse).toList());
        }
        return response;
    }

    public EntityCourse createCourse(CourseRequest request, GenericResponse response) {
        if (!validateCourse(request, response)) {
            return null;
        }
        EntityCourse course = mapToEntity(request);
        response.success();
        response.listMessage.add("Curso creado satisfactoriamente");
        return courseRepo.save(course);
    }

    private boolean validateCourse(CourseRequest request, GenericResponse response) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El título del curso es requerido");
            return false;
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("La descripción del curso es requerida");
            return false;
        }
        if (request.getCoverImage() == null || request.getCoverImage().isEmpty()) {
            response.warning();
            response.listMessage.add("La imagen de portada es requerida");
            return false;
        }
        if (request.getLevel() == null || request.getLevel().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El nivel del curso es requerido");
            return false;
        }
        if (request.getPrice() < 0) {
            response.warning();
            response.listMessage.add("El precio debe ser mayor o igual a 0");
            return false;
        }
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El estado del curso es requerido");
            return false;
        }
        if (request.getIdTeacher() == null || request.getIdTeacher().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El docente es requerido");
            return false;
        }
        if (request.getIdCategory() == null) {
            response.warning();
            response.listMessage.add("La categoría es requerida");
            return false;
        }
        return true;
    }

    public boolean publish(String idCourse, GenericResponse response) {
        EntityCourse entity = courseRepo.findById(idCourse).orElse(null);
        if (entity == null) {
            response.warning();
            response.listMessage.add("Curso no encontrado");
            return false;
        }
        long totalLessons = lessonRepo.countByCourse_IdCourse(idCourse);
        if (totalLessons == 0) {
            response.warning();
            response.listMessage.add("El curso no tiene lecciones");
            return false;
        }
        entity.setStatus(EStatus.PUBLISHED);
        courseRepo.save(entity);
        response.success();
        response.listMessage.add("Curso publicado exitosamente");
        return true;
    }

    public boolean unpublish(String idCourse, GenericResponse response) {
        EntityCourse entity = courseRepo.findById(idCourse).orElse(null);
        if (entity == null) {
            response.warning();
            response.listMessage.add("Curso no encontrado");
            return false;
        }
        entity.setStatus(EStatus.DRAFT);
        courseRepo.save(entity);
        response.success();
        response.listMessage.add("Curso despublicado exitosamente");
        return true;
    }

    public List<CourseResponse> findAllCourse() {
        return courseRepo.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<CourseResponse> findByCategoryName(EntityCategory category) {
        return courseRepo.findByCategoryName(category)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public boolean deleteCourse(String idCourse, GenericResponse response) {
        if (idCourse == null || idCourse.trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El ID del curso es requerido");
            return false;
        }
        EntityCourse course = courseRepo.findById(idCourse).orElse(null);
        if (course == null) {
            response.warning();
            response.listMessage.add("Curso no encontrado");
            return false;
        }

        if (course.getEnrollments() != null && !course.getEnrollments().isEmpty()) {
            response.warning();
            response.listMessage.add("No se puede eliminar el curso porque tiene alumnos matriculados");
            return false;
        }

        courseRepo.delete(course);
        response.success();
        response.listMessage.add("Curso eliminado correctamente");
        return true;
    }

    @Transactional
    public EntityCourse updateCourse(String idCourse, CourseRequest request, GenericResponse response) {
        if (!validateCourse(request, response)) {
            return null;
        }
        EntityCourse course = courseRepo.findById(idCourse).orElse(null);
        if (course == null) {
            response.warning();
            response.listMessage.add("Curso no encontrado");
            return null;
        }
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        String fileName = saveImage(request.getCoverImage());
        course.setCoverImage(fileName);
        course.setLevel(ELevel.valueOf(request.getLevel()));
        course.setPrice(request.getPrice());
        course.setStatus(EStatus.valueOf(request.getStatus()));
        if (request.getIdTeacher() != null) {
            EntityUser teacher = new EntityUser();
            teacher.setIdUser(request.getIdTeacher());
            course.setTeacher(teacher);
        }
        if (request.getIdCategory() != null) {
            EntityCategory category = new EntityCategory();
            category.setIdCategory(request.getIdCategory());
            course.setCategory(category);
        }
        course.setUpdatedAt(LocalDateTime.now());
        response.success();
        response.listMessage.add("Curso actualizado correctamente");
        return courseRepo.save(course);
    }

    public List<CourseResponse> findByTeacherCourse(String idTeacher) {
        EntityUser teacher = new EntityUser();
        teacher.setIdUser(idTeacher);
        return courseRepo.findByTeacher(teacher)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public CourseResponse getById(String idCourse, GenericResponse response) {
        System.out.println(">>> Buscando curso con ID: '" + idCourse + "'");
        EntityCourse entity = courseRepo.findById(idCourse).orElse(null);
        if (entity == null) {
            response.warning();
            response.listMessage.add("Curso no encontrado");
            return null;
        }
        response.success();
        response.listMessage.add("Curso encontrado");
        return mapToResponse(entity);
    }

    private String saveImage(MultipartFile image) {

        try {

            if (image == null || image.isEmpty()) {
                return null;
            }
            Path uploadPath = Paths.get(storagePath, "courses");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = image.getOriginalFilename();

            String fileName = UUID.randomUUID().toString()
                    + "_"
                    + originalName.replaceAll("\\s+", "_");

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            System.out.println("Imagen guardada en: " + filePath);

            // Solo guardar el nombre en la BD
            return fileName;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

    }

    public List<CourseResponse> getCoursesWithLessonsAndFilesByTeacher(String teacher, GenericResponse response) {

        List<EntityCourse> courses = courseRepo.findByTeacherId(teacher);
        if (courses == null) {
            response.warning();
            response.listMessage.add("No se encontraron cursos");
            return null;
        }
        response.success();
        response.listMessage.add("Cursos encontrados");

        return courses.stream().map(course -> {
            CourseResponse c = mapToResponse(course);

            List<EntityLesson> lessons = lessonRepo.findByCourseId(course.getIdCourse());

            List<LessonResponse> lessonResponses = lessons.stream().map(lesson -> {

                LessonResponse l = mapToLessonResponse(lesson);

                List<EntityLessonFile> files = lessonFileRepo.findByLessonId(
                        lesson.getIdLesson());

                List<LessonFileResponse> fileResponses = files.stream()
                        .map(this::mapToLessonFileResponse)
                        .collect(Collectors.toList());

                l.setFiles(fileResponses);

                return l;

            }).collect(Collectors.toList());

            c.setLessons(lessonResponses);
            c.setTotalLessons(lessonResponses.size());

            return c;

        }).collect(Collectors.toList());
    }

    private LessonResponse mapToLessonResponse(EntityLesson lesson) {
        LessonResponse r = new LessonResponse();
        r.setIdLesson(lesson.getIdLesson());
        r.setTitle(lesson.getTitle());
        r.setDescription(lesson.getDescription());
        r.setType(lesson.getType().toString());
        r.setContentUrl(baseUrl + "/lesson-videos/" + lesson.getContentUrl());
        r.setDurationMinutes(lesson.getDurationMinutes());
        r.setLessonOrder(lesson.getLessonOrder());
        r.setIsFree(lesson.getIsFree());
        r.setCreatedAt(lesson.getCreatedAt());
        return r;
    }

    private LessonFileResponse mapToLessonFileResponse(EntityLessonFile file) {
        LessonFileResponse r = new LessonFileResponse();
        r.setIdFile(file.getIdFile());
        r.setFileName(file.getFileName());
        r.setFileType(file.getFileType().toString());
        r.setFileUrl(file.getFileUrl());
        r.setFileOrder(file.getFileOrder());
        return r;
    }

    public List<CourseCardResponse> findAllPublishedCourses() {
        return courseRepo.findAllPublishedCourses().stream().map(course -> {
            CourseCardResponse response = new CourseCardResponse();
            response.setIdCourse(course.getIdCourse());
            response.setTitle(course.getTitle());
            response.setDescription(course.getDescription());
            response.setCoverImage(baseUrl + "/course-images/" + course.getCoverImage());
            response.setLevel(course.getLevel().toString());
            response.setPrice(course.getPrice());
            response.setStatus(course.getStatus().toString());
            response.setCategoryName(course.getCategory().getName());
            response.setTeacherFullName(course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName());
            response.setTotalLessons(course.getLessons().size());
            return response;
        }).collect(Collectors.toList());
    }

    public List<CourseResponse> searchCourses(String value, GenericResponse response) {

        String search = normalize(value);
        List<CourseResponse> result = courseRepo
                .findAllPublishedCoursesForSearch()
                .stream()

                .filter(course -> {

                    String title = normalize(course.getTitle());
                    String description = normalize(course.getDescription());
                    String category = normalize(course.getCategory().getName());

                    String[] words = search.split("\\s+");

                    for (String word : words) {

                        if (title.contains(word)
                                || description.contains(word)
                                || category.contains(word)) {
                            return true;
                        }
                    }

                    return false;
                })

                .sorted(Comparator.comparingInt(
                        (EntityCourse c) -> calculateScore(c, search))
                        .reversed())

                .map(this::mapToResponse)
                .toList();

        if (result.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron cursos");
            return List.of();
        }

        response.success();
        response.listMessage.add("Cursos encontrados");

        return result;
    }

    private String normalize(String text) {

        if (text == null)
            return "";
        return Normalizer
                .normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }

    private int calculateScore(EntityCourse course, String search) {

        int score = 0;

        String title = normalize(course.getTitle());
        String description = normalize(course.getDescription());
        String category = normalize(course.getCategory().getName());

        String[] words = search.split("\\s+");

        for (String word : words) {

            if (title.contains(word))
                score += 10;

            if (category.contains(word))
                score += 7;

            if (description.contains(word))
                score += 3;
        }
        return score;
    }
}
