package com.epiis.DS26.business;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.epiis.DS26.dto.request.EnrollmentRequest;
import com.epiis.DS26.dto.response.CertificateResponse;
import com.epiis.DS26.dto.response.EnrollmentResponse;
import com.epiis.DS26.dto.response.MyCourseResponse;
import com.epiis.DS26.entity.EntityCourse;
import com.epiis.DS26.entity.EntityEnrollment;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.enums.EStatus;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.CourseRepo;
import com.epiis.DS26.repositorie.EnrollmentRepo;

import jakarta.transaction.Transactional;

@Service
public class EnrollmentBusiness {
    private final EnrollmentRepo enrollmentRepo;
    private final AuthenticationBusiness authenticationBusiness;
    private final CourseRepo courseRepo;

    @Value("${app.base-url}")
    private String baseUrl;

    private ZoneId zoneId = ZoneId.of("America/Lima");

    public EnrollmentBusiness(EnrollmentRepo enrollmentRepo, AuthenticationBusiness authenticationBusiness,
            CourseRepo courseRepo) {
        this.enrollmentRepo = enrollmentRepo;
        this.authenticationBusiness = authenticationBusiness;
        this.courseRepo = courseRepo;
    }

    private EntityEnrollment mapToRequestEntity(EntityCourse course, EntityUser student) {
        EntityEnrollment entity = new EntityEnrollment();
        entity.setIdEnrollment(UUID.randomUUID().toString());
        entity.setStudent(student);
        entity.setCourse(course);

        entity.setEnrollmentDate(LocalDateTime.now(zoneId));
        entity.setLastAccess(LocalDateTime.now(zoneId));
        entity.setTotalProgress(0);
        entity.setCompleted(false);
        return entity;
    }

    private boolean validateEnrollment(EntityCourse course, EntityUser student, GenericResponse message) {
        if (!student.getRole().name().equals("ROLE_STUDENT")) {
            message.warning();
            message.listMessage.add("Solo un alumno puede inscribirse.");
            return false;
        }
        if (course == null) {
            message.warning();
            message.listMessage.add("El curso no encontrado");
            return false;
        }
        if (course.getStatus() != EStatus.PUBLISHED) {
            message.warning();
            message.listMessage.add("El curso no esta publicado");
            return false;
        }
        if (course.getTeacher().getIdUser().equals(student.getIdUser())) {
            message.warning();
            message.listMessage.add("El estudiante no puede inscribirse en su propio curso");
            return false;
        }
        boolean isEnrolled = enrollmentRepo.existsByStudent_idUserAndCourse_idCourse(student.getIdUser(),
                course.getIdCourse());
        if (isEnrolled) {
            message.warning();
            message.listMessage.add("El estudiante ya está inscrito en este curso");
            return false;
        }
        return true;
    }

    public boolean isEnrolled(String courseId) {
        EntityUser student = authenticationBusiness.getCurrentUser();
        return enrollmentRepo.existsByStudent_idUserAndCourse_idCourse(student.getIdUser(),
                courseId);
    }

    @Transactional
    public EntityEnrollment enrollInCourse(EnrollmentRequest request, GenericResponse message) {
        EntityUser student = authenticationBusiness.getCurrentUser();
        EntityCourse course = courseRepo.findById(request.getCourseId())
                .orElse(null);
        if (!validateEnrollment(course, student, message)) {
            return null;
        }
        EntityEnrollment enrollment = mapToRequestEntity(course, student);
        message.success();
        message.listMessage.add("Te has inscrito en el curso exitosamente");
        return enrollmentRepo.save(enrollment);
    }

    public EnrollmentResponse mapToResponse(EntityEnrollment entity) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setIdEnrollment(entity.getIdEnrollment());
        response.setStudentId(entity.getStudent().getIdUser());
        response.setCourseId(entity.getCourse().getIdCourse());
        response.setStudentName(entity.getStudent().getFirstName() + " " + entity.getStudent().getLastName());
        response.setCourseTitle(entity.getCourse().getTitle());
        response.setEnrollmentDate(entity.getEnrollmentDate());
        response.setTotalProgress(entity.getTotalProgress());
        response.setCompleted(entity.isCompleted());
        return response;
    }

    // busqueda por id de inscripcion
    public EnrollmentResponse getEnrollmentById(String idEnrollment) {
        Optional<EntityEnrollment> optionalEnrollment = enrollmentRepo.findById(idEnrollment);
        if (optionalEnrollment.isPresent()) {
            EntityEnrollment entity = optionalEnrollment.get();
            return mapToResponse(entity);
        }
        return null;
    }

    // busqueda de todas las inscripciones
    public List<EnrollmentResponse> getAllEnrollments() {
        List<EntityEnrollment> entityList = enrollmentRepo.findAll();
        return entityList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public boolean deleteEnrollment(String idEnrollment, GenericResponse message) {
        if (idEnrollment.isEmpty()) {
            message.warning();
            message.listMessage.add("El ID de la inscripción es requerido");
            return false;
        }
        Optional<EntityEnrollment> optionalEnrollment = enrollmentRepo.findById(idEnrollment);
        if (!optionalEnrollment.isPresent()) {
            message.warning();
            message.listMessage.add("Inscripción no encontrada");
            return false;
        }
        enrollmentRepo.delete(optionalEnrollment.get());
        message.success();
        message.listMessage.add("Inscripción eliminada exitosamente");
        return true;
    }

    @Transactional
    public EntityEnrollment updateProgress(String idEnrollment, Integer totalProgress, GenericResponse message) {
        if (idEnrollment.isEmpty()) {
            message.warning();
            message.listMessage.add("El ID de la inscripción es requerido");
            return null;
        }
        Optional<EntityEnrollment> optionalEnrollment = enrollmentRepo.findById(idEnrollment);
        if (optionalEnrollment.isPresent()) {
            EntityEnrollment entity = optionalEnrollment.get();
            entity.setTotalProgress(totalProgress);
            entity.setLastAccess(LocalDateTime.now(zoneId));
            entity.setCompleted(totalProgress >= 100);
            message.success();
            message.listMessage.add("Progreso actualizado exitosamente");
            return enrollmentRepo.save(entity);
        }
        message.warning();
        message.listMessage.add("Inscripción no encontrada");
        return null;
    }

    public List<EnrollmentResponse> getEnrollmentReport(String studentId) {
        return enrollmentRepo.findByStudent_idUser(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MyCourseResponse mapToMyCourseResponse(EntityEnrollment entity) {
        MyCourseResponse response = new MyCourseResponse();
        response.setIdEnrollment(entity.getIdEnrollment());
        response.setIdCourse(entity.getCourse().getIdCourse());
        response.setTitle(entity.getCourse().getTitle());
        response.setDescription(entity.getCourse().getDescription());
        response.setCoverImage(baseUrl + "/course-images/" + entity.getCourse().getCoverImage());
        response.setTeacherFullName(
                entity.getCourse().getTeacher().getFirstName() + " " + entity.getCourse().getTeacher().getLastName());
        response.setCategoryName(entity.getCourse().getCategory().getName());
        response.setTotalLessons(entity.getCourse().getLessons().size());
        response.setTotalProgress(entity.getTotalProgress());
        response.setCompleted(entity.isCompleted());
        response.setLastAccess(entity.getLastAccess());
        return response;
    }

    public List<MyCourseResponse> getMyCouses() {
        EntityUser student = authenticationBusiness.getCurrentUser();
        return enrollmentRepo.findByStudent_idUserOrderByLastAccessDesc(student.getIdUser())
                .stream()
                .map(this::mapToMyCourseResponse)
                .toList();
    }

    @Transactional
    public CertificateResponse getCertificate(String idCourse, GenericResponse message) {
        EntityUser student = authenticationBusiness.getCurrentUser();
        EntityEnrollment enrollment = enrollmentRepo
                .findByStudent_idUserAndCourse_idCourse(student.getIdUser(), idCourse).orElse(null);

        if (enrollment == null) {
            message.warning();
            message.listMessage.add("No estás inscrito en este curso");
            return null;
        }

        if (!enrollment.isCompleted()) {
            message.warning();
            message.listMessage.add("No has completado el curso aún");
            return null;
        }

        CertificateResponse cert = new CertificateResponse();

        // Generate a deterministic hash for the certificate ID using enrollment id
        String input = enrollment.getIdEnrollment() + "-CERT";
        int hash = 0;
        for (int i = 0; i < input.length(); i++) {
            hash = 31 * hash + input.charAt(i);
        }
        String certId = "CERT-" + Integer.toHexString(Math.abs(hash)).toUpperCase() + "-"
                + java.time.Year.now(zoneId).getValue();

        cert.setCertificateId(certId);
        cert.setStudentName(student.getFirstName() + " " + student.getLastName());
        cert.setCourseName(enrollment.getCourse().getTitle());
        cert.setTeacherName(enrollment.getCourse().getTeacher().getFirstName() + " "
                + enrollment.getCourse().getTeacher().getLastName());
        cert.setTotalLessons(enrollment.getCourse().getLessons().size());

        // Use last access as completion date for now
        cert.setCompletionDate(enrollment.getLastAccess());

        message.success();
        message.listMessage.add("Certificado generado exitosamente");
        return cert;
    }

}
