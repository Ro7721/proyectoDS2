package com.epiis.DS26.business;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.epiis.DS26.dto.request.LessonProgressRequest;
import com.epiis.DS26.dto.response.CourseContentResponse;
import com.epiis.DS26.dto.response.CourseProgressResponse;
import com.epiis.DS26.dto.response.LessonContentResponse;
import com.epiis.DS26.dto.response.LessonFileResponse;
import com.epiis.DS26.entity.EntityCourse;
import com.epiis.DS26.entity.EntityEnrollment;
import com.epiis.DS26.entity.EntityLesson;
import com.epiis.DS26.entity.EntityLessonProgress;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.EnrollmentRepo;
import com.epiis.DS26.repositorie.LessonProgressRepo;
import com.epiis.DS26.repositorie.LessonRepo;

@Service
public class LearningBusiness {

    private static final int COMPLETION_THRESHOLD = 90;
    private final EnrollmentRepo enrollmentRepo;
    private final LessonRepo lessonRepo;
    private final LessonProgressRepo lessonProgressRepo;
    private final AuthenticationBusiness auth;

    @Value("${app.base-url}")
    private String baseUrl;

    public LearningBusiness(EnrollmentRepo enrollmentRepo, LessonRepo lessonRepo, LessonProgressRepo lessonProgressRepo,
            AuthenticationBusiness auth) {
        this.enrollmentRepo = enrollmentRepo;
        this.lessonRepo = lessonRepo;
        this.lessonProgressRepo = lessonProgressRepo;
        this.auth = auth;
    }

    public CourseContentResponse getCourseContent(String idCourse, GenericResponse response) {
        EntityUser student = auth.getCurrentUser();
        if (student == null) {
            response.error();
            response.listMessage.add("Usuario no autenticado");
            return null;
        }
        CourseContentResponse dto = new CourseContentResponse();
        EntityEnrollment enrollment = enrollmentRepo
                .findByStudent_idUserAndCourse_idCourse(student.getIdUser(), idCourse).orElse(null);
        if (enrollment == null) {
            response.error();
            response.listMessage.add("No estás inscrito en este curso");
            return null;
        }
        enrollment.setLastAccess(LocalDateTime.now(ZoneId.of("America/Lima")));
        enrollmentRepo.save(enrollment);

        EntityCourse course = enrollment.getCourse();
        response.success();
        response.listMessage.add("Contenido del curso cargado exitosamente");

        dto.setIdCourse(course.getIdCourse());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCoverImage(baseUrl + "/course-images/" + course.getCoverImage());
        dto.setTeacherFullName(
                course.getTeacher().getFirstName()
                        + " "
                        + course.getTeacher().getLastName());
        dto.setTotalLessons(course.getLessons().size());
        dto.setCategoryName(course.getCategory().getName());
        dto.setTotalProgress(enrollment.getTotalProgress());
        dto.setCompleted(enrollment.isCompleted());
        dto.setLastAccess(enrollment.getLastAccess());
        Map<String, EntityLessonProgress> progressMap = lessonProgressRepo
                .findByEnrollment_IdEnrollment(enrollment.getIdEnrollment())
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        p -> p.getLesson().getIdLesson(),
                        p -> p));

        dto.setLessons(
                course.getLessons()
                        .stream()
                        .filter(Objects::nonNull)
                        .sorted(Comparator.comparing(lesson -> lesson.getLessonOrder()))
                        .map(lesson -> mapLesson(lesson, progressMap))
                        .toList());

        return dto;
    }

    private LessonContentResponse mapLesson(EntityLesson lesson, Map<String, EntityLessonProgress> progressMap) {

        LessonContentResponse dto = new LessonContentResponse();

        EntityLessonProgress progress = progressMap.get(lesson.getIdLesson());

        dto.setIdLesson(lesson.getIdLesson());
        dto.setTitle(lesson.getTitle());
        dto.setDescription(lesson.getDescription());
        dto.setType(lesson.getType().name());
        dto.setContentUrl(baseUrl + "/lesson-videos/" + lesson.getContentUrl());
        dto.setDurationMinutes(lesson.getDurationMinutes());
        dto.setLessonOrder(lesson.getLessonOrder());
        dto.setFree(lesson.getIsFree());

        if (progress != null) {
            dto.setWatchedPercentage(progress.getWatchedPercentage());
            dto.setLastPositionSeconds(progress.getLastPositionSeconds());
            dto.setCompleted(progress.isCompleted());
            dto.setCompletedAt(progress.getCompletedAt());
        } else {
            dto.setWatchedPercentage(0);
            dto.setLastPositionSeconds(0);
            dto.setCompleted(false);
        }

        dto.setFiles(
                lesson.getFiles()
                        .stream()
                        .sorted(Comparator.comparing(f -> f.getFileOrder()))
                        .map(file -> {
                            LessonFileResponse f = new LessonFileResponse();
                            f.setIdFile(file.getIdFile());
                            f.setFileName(file.getFileName());
                            f.setFileUrl(baseUrl + "/lesson-videos/" + file.getFileUrl());
                            f.setFileType(file.getFileType().name());
                            f.setFileOrder(file.getFileOrder());
                            return f;
                        })
                        .toList());

        return dto;
    }

    public CourseProgressResponse saveProgress(LessonProgressRequest request, GenericResponse response) {
        EntityUser student = auth.getCurrentUser();

        if (request.getIdLesson() == null || request.getIdLesson().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El id de la lección es requerido");
            return null;
        }
        int percentage = clampPercentage(request.getWatchedPercentage());

        EntityLesson lesson = lessonRepo.findById(request.getIdLesson()).orElse(null);
        if (lesson == null) {
            response.warning();
            response.listMessage.add("La lección no existe");
            return null;
        }

        EntityEnrollment enrollment = enrollmentRepo
                .findByStudent_idUserAndCourse_idCourse(student.getIdUser(), lesson.getCourse().getIdCourse())
                .orElse(null);
        if (enrollment == null) {
            response.error();
            response.listMessage.add("No estás inscrito en el curso de esta lección");
            return null;
        }

        EntityLessonProgress progress = lessonProgressRepo
                .findByEnrollment_IdEnrollmentAndLesson_IdLesson(enrollment.getIdEnrollment(), lesson.getIdLesson())
                .orElseGet(() -> {
                    EntityLessonProgress p = new EntityLessonProgress();
                    p.setIdProgress(UUID.randomUUID().toString());
                    p.setEnrollment(enrollment);
                    p.setLesson(lesson);
                    return p;
                });

        boolean changed = false;

        int previousPercentage = progress.getWatchedPercentage();
        if (percentage > previousPercentage) {
            progress.setWatchedPercentage(percentage);
            changed = true;
        }

        Integer newPosition = request.getLastPositionSeconds() == null
                ? 0
                : request.getLastPositionSeconds();
        if (progress.getLastPositionSeconds() != newPosition) {
            progress.setLastPositionSeconds(newPosition);
            changed = true;
        }

        if (!progress.isCompleted()
                && progress.getWatchedPercentage() >= COMPLETION_THRESHOLD) {
            progress.setCompleted(true);
            progress.setCompletedAt(
                    Timestamp.valueOf(LocalDateTime.now()));
            changed = true;
        }

        if (changed) {
            lessonProgressRepo.save(progress);
            recalculateEnrollmentProgress(enrollment);
        }
        response.success();
        response.listMessage.add("Progreso guardado correctamente");

        CourseProgressResponse dto = new CourseProgressResponse();
        dto.setIdLesson(lesson.getIdLesson());
        dto.setLessonCompleted(progress.isCompleted());
        dto.setWatchedPercentage(progress.getWatchedPercentage());
        dto.setLastPositionSeconds(progress.getLastPositionSeconds());
        dto.setTotalProgress(enrollment.getTotalProgress());
        dto.setCourseCompleted(enrollment.isCompleted());
        return dto;
    }

    private void recalculateEnrollmentProgress(EntityEnrollment enrollment) {
        EntityCourse course = enrollment.getCourse();
        long totalLessons = course.getLessons() != null ? course.getLessons().size() : 0;

        if (totalLessons == 0) {
            enrollment.setTotalProgress(0);
            enrollment.setCompleted(false);
            enrollmentRepo.save(enrollment);
            return;
        }

        long completedLessons = lessonProgressRepo
                .countByEnrollment_IdEnrollmentAndIsCompletedTrue(enrollment.getIdEnrollment());

        int totalProgress = (int) Math.round((completedLessons * 100.0) / totalLessons);
        enrollment.setTotalProgress(totalProgress);
        enrollment.setCompleted(completedLessons >= totalLessons);
        enrollmentRepo.save(enrollment);
    }

    private int clampPercentage(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value));
    }

}
