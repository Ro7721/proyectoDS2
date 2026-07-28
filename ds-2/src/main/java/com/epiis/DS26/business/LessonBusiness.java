package com.epiis.DS26.business;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.epiis.DS26.dto.request.LessonRequest;
import com.epiis.DS26.dto.response.LessonFileResponse;
import com.epiis.DS26.dto.response.LessonResponse;
import com.epiis.DS26.entity.EntityCourse;
import com.epiis.DS26.entity.EntityLesson;
import com.epiis.DS26.entity.EntityLessonFile;
import com.epiis.DS26.enums.EType;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.LessonFileRepo;
import com.epiis.DS26.repositorie.LessonRepo;

import ws.schild.jave.MultimediaObject;

@Service
public class LessonBusiness {

    private static final int MAX_ADJUNCT_FILES = 5;
    private static final String FOLDER_LESSONS = "lessons";
    private static final String TYPE_VIDEO = "video";

    private final LessonRepo lessonRepo;
    private final LessonFileRepo lessonFileRepo;

    @Value("${app.base-url}")
    private String baseUrl;
    @Value("${app.storage.path}")
    private String storagePath;

    public LessonBusiness(LessonRepo lessonRepos, LessonFileRepo lessonFileRepos) {
        this.lessonRepo = lessonRepos;
        this.lessonFileRepo = lessonFileRepos;
    }

    public EntityLesson insert(LessonRequest request, MultipartFile mainVideoFile, List<MultipartFile> adjunctFiles,
            GenericResponse response) {
        if (!validateLesson(request, response)) {
            return null;
        }
        if (adjunctFiles != null && adjunctFiles.size() > MAX_ADJUNCT_FILES) {
            response.warning();
            response.listMessage.add("Máximo " + MAX_ADJUNCT_FILES + " archivos adjuntos por lección");
            return null;
        }
        // 2. Asignar el orden automáticamente basado en la última lección del curso
        Integer nextOrder = lessonRepo.findMaxLessonOrderByCourseId(request.getCourseId()) + 1;
        request.setLessonOrder(nextOrder);
        String videoFileName = null;
        File savedVideoFile = null;

        // 3. Procesar el video principal de la lección si el tipo es VIDEO
        if ("VIDEO".equalsIgnoreCase(request.getType())) {
            if (mainVideoFile == null || mainVideoFile.isEmpty()) {
                response.warning();
                response.listMessage.add("El archivo de video principal es requerido para este tipo de lección");
                return null;
            }

            if (!isValidVideoFile(mainVideoFile)) {
                response.warning();
                response.listMessage.add("El formato del archivo '" + mainVideoFile.getOriginalFilename()
                        + "' no es un video válido (.mp4, .avi, .mov, .mkv)");
                return null;
            }
            // Guardar el video en la carpeta /lessons/video/
            videoFileName = saveFileToDisk(mainVideoFile, TYPE_VIDEO, response);
            if (videoFileName == null)
                return null;

            Path videoPath = Paths.get(storagePath, FOLDER_LESSONS, TYPE_VIDEO, videoFileName);
            savedVideoFile = videoPath.toFile();

            // Extraer duración del video automáticamente usando JAVE
            Integer duration = extractVideoDuration(savedVideoFile);
            if (duration == null) {
                response.warning();
                response.listMessage.add("No se pudo analizar la duración del archivo de video");
                return null;
            }
            request.setDurationMinutes(duration);
            request.setContenUrl(videoFileName); // El contenido de la lección es el nombre del video
        }
        // 4. Mapear y guardar la lección en la base de datos
        EntityLesson lesson = mapRequestToEntity(request);
        lesson = lessonRepo.save(lesson);
        // 5. Procesar los archivos adjuntos complementarios (pueden ser PDFs, ZIPs,
        if (adjunctFiles != null && !adjunctFiles.isEmpty()) {
            saveAdjunctFiles(lesson, adjunctFiles, response);
        }
        response.success();
        response.listMessage.add("Lección insertada correctamente con su video principal y " +
                (adjunctFiles != null ? adjunctFiles.size() : 0) + " archivo(s) adjunto(s).");
        return lesson;
    }

    private Integer extractVideoDuration(File videoFile) {
        try {

            MultimediaObject media = new MultimediaObject(videoFile);
            long durationMs = media.getInfo().getDuration(); // en milisegundos
            // videoFile.delete();
            int durationMinutes = (int) Math.ceil(durationMs / 60000.0);
            return Math.max(1, durationMinutes);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void saveAdjunctFiles(EntityLesson lesson, List<MultipartFile> files, GenericResponse response) {
        int order = 1;
        for (MultipartFile file : files) {
            String url = saveFileToDisk(file, "files", response);
            if (url == null) {
                return;
            }
            EntityLessonFile lessonFile = new EntityLessonFile();
            lessonFile.setIdFile(UUID.randomUUID().toString());
            lessonFile.setLesson(lesson);
            lessonFile.setFileName(file.getOriginalFilename());
            lessonFile.setFileUrl(url);
            String extension = getFileExtension(file.getOriginalFilename());
            if ("pdf".equals(extension)) {
                lessonFile.setFileType(EType.PDF);
            } else {
                lessonFile.setFileType(EType.TEXT);
            }
            lessonFile.setFileOrder(order++);
            lessonFile.setCreatedAt(LocalDateTime.now());

            lessonFileRepo.save(lessonFile);
        }
    }

    private String saveFileToDisk(MultipartFile file, String type, GenericResponse response) {
        try {

            String originalName = file.getOriginalFilename();
            String fileName = UUID.randomUUID().toString();

            if (originalName != null && !originalName.isBlank()) {
                fileName += "_" + originalName.replaceAll("\\s+", "_");
            }

            Path uploadPath = Paths.get(storagePath, FOLDER_LESSONS, type.toLowerCase());

            if (Files.notExists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Carpeta creada: " + uploadPath);
            }

            Path destination = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return fileName;

        } catch (Exception e) {

            e.printStackTrace();
            response.error();
            response.listMessage.add(
                    "Error al guardar archivo: " + e.getMessage());

            return null;
        }
    }

    private boolean isValidVideoFile(MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        return name.matches(".*\\.(mp4|avi|mov|mkv)$");
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains("."))
            return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private EntityLesson mapRequestToEntity(LessonRequest request) {
        EntityLesson entity = new EntityLesson();
        EntityCourse course = new EntityCourse();
        course.setIdCourse(request.getCourseId());

        entity.setIdLesson(UUID.randomUUID().toString());
        entity.setCourse(course);
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setType(EType.valueOf(request.getType() != null ? request.getType().toUpperCase() : EType.VIDEO.name()));
        entity.setContentUrl(request.getContenUrl());
        if (request.getDurationMinutes() != null) {
            entity.setDurationMinutes(request.getDurationMinutes());
        }
        entity.setLessonOrder(request.getLessonOrder());
        entity.setIsFree(request.isFree());
        entity.setCreatedAt(LocalDateTime.now());
        return entity;
    }

    public EntityLesson updateLesson(String idLesson, LessonRequest request, MultipartFile mainVideoFile,
            List<MultipartFile> adjunctFiles, GenericResponse response) {
        if (!validateLesson(request, response)) {
            return null;
        }

        EntityLesson lesson = lessonRepo.findById(idLesson).orElse(null);
        if (lesson == null) {
            response.warning();
            response.listMessage.add("La lección no existe");
            return null;
        }

        mapBasicLessonFields(lesson, request);

        if (!processVideoUpdate(lesson, request, mainVideoFile, response)) {
            return null;
        }

        lesson = lessonRepo.save(lesson);

        if (adjunctFiles != null && !adjunctFiles.isEmpty()) {
            saveAdjunctFiles(lesson, adjunctFiles, response);
        }

        response.success();
        response.listMessage.add("Lección actualizada correctamente.");
        return lesson;
    }

    private void mapBasicLessonFields(EntityLesson lesson, LessonRequest request) {
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setType(EType.valueOf(request.getType() != null ? request.getType().toUpperCase() : EType.VIDEO.name()));
        lesson.setLessonOrder(request.getLessonOrder());
        lesson.setIsFree(request.isFree());
    }

    private boolean processVideoUpdate(EntityLesson lesson, LessonRequest request, MultipartFile mainVideoFile,
            GenericResponse response) {
        if (mainVideoFile != null && !mainVideoFile.isEmpty()) {
            if (!"VIDEO".equalsIgnoreCase(request.getType())) {
                return true;
            }
            if (!isValidVideoFile(mainVideoFile)) {
                response.warning();
                response.listMessage.add("El formato de video es inválido");
                return false;
            }

            String videoFileName = saveFileToDisk(mainVideoFile, TYPE_VIDEO, response);
            if (videoFileName != null) {
                Path videoPath = Paths.get(storagePath, FOLDER_LESSONS, TYPE_VIDEO, videoFileName);
                Integer duration = extractVideoDuration(videoPath.toFile());

                lesson.setDurationMinutes(duration != null ? duration : 1);
                lesson.setContentUrl(videoFileName);
            }
        } else if (request.getContenUrl() != null && !request.getContenUrl().isEmpty()) {
            lesson.setContentUrl(request.getContenUrl());
        }

        return true;
    }

    private boolean validateLesson(LessonRequest request, GenericResponse gresponse) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            gresponse.warning();
            gresponse.listMessage.add("El título de la lección es requerido");
            return false;
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            gresponse.warning();
            gresponse.listMessage.add("La descripción de la lección es requerida");
            return false;
        }
        if (request.getType() == null || request.getType().trim().isEmpty()) {
            gresponse.warning();
            gresponse.listMessage.add("El tipo de lección es requerido");
            return false;
        }
        boolean hasFiles = request.getMainVideoFile() != null && !request.getMainVideoFile().isEmpty();
        boolean hasContentUrl = request.getContenUrl() != null && !request.getContenUrl().trim().isEmpty();

        if (!hasFiles && !hasContentUrl) {
            gresponse.warning();
            gresponse.listMessage.add("Se requiere subir al menos un archivo o proporcionar una URL de contenido");
            return false;
        }

        return true;
    }

    public LessonResponse mapToResponse(EntityLesson entity) {
        LessonResponse response = new LessonResponse();
        response.setIdLesson(entity.getIdLesson());
        response.setCourseId(entity.getCourse() != null ? entity.getCourse().getIdCourse() : null);
        response.setCreatedAt(entity.getCreatedAt());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setType(entity.getType().name());
        response.setContentUrl(buildContentUrl(entity));
        response.setDurationMinutes(entity.getDurationMinutes());
        response.setLessonOrder(entity.getLessonOrder());
        response.setIsFree(entity.getIsFree());
        List<EntityLessonFile> files = lessonFileRepo.findByLesson_IdLessonOrderByFileOrderAsc(entity.getIdLesson());
        response.setFiles(files.stream().map(this::mapFileToResponse).toList());
        return response;
    }

    private String buildContentUrl(EntityLesson lesson) {

        String folder = switch (lesson.getType()) {
            case VIDEO -> "lesson-videos";
            case PDF, TEXT -> "lesson-files";
        };

        return baseUrl + "/" + folder + "/" + lesson.getContentUrl();
    }

    private LessonFileResponse mapFileToResponse(EntityLessonFile e) {
        LessonFileResponse r = new LessonFileResponse();
        r.setIdFile(e.getIdFile());
        r.setFileName(e.getFileName());
        r.setFileUrl(buildFileUrl(e));
        r.setFileType(e.getFileType().name());
        r.setFileOrder(e.getFileOrder());
        return r;
    }

    private String buildFileUrl(EntityLessonFile file) {

        String folder = switch (file.getFileType()) {

            case VIDEO -> "lesson-videos";

            case PDF, TEXT -> "lesson-files";
        };

        return baseUrl
                + "/"
                + folder
                + "/"
                + file.getFileUrl();
    }

    public List<LessonResponse> getLesson() {
        List<EntityLesson> lessons = lessonRepo.findAll();

        return lessons.stream()
                .map(this::mapToResponse).toList();
    }

    public boolean deleteLesson(String idLeson, GenericResponse response) {
        if (idLeson.isEmpty()) {
            response.error();
            response.listMessage.add("El Id de la lección es obligatorio");
            return false;
        }
        EntityLesson lesson = lessonRepo.findById(idLeson).orElse(null);
        if (lesson == null) {
            response.warning();
            response.listMessage.add("La lección no existe");
            return false;
        }
        lessonRepo.delete(lesson);
        response.success();
        response.listMessage.add("Lección eliminada correctamente");
        return true;
    }

    public List<LessonResponse> getLessonsByTeacher(String teacherId) {

        List<EntityLesson> lessons = lessonRepo
                .findByCourse_Teacher_IdUserOrderByCourse_TitleAscLessonOrderAsc(teacherId);

        return lessons.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<LessonResponse> getLessonsByCourseAndTeacher(String courseId, String teacherId) {

        List<EntityLesson> lessons = lessonRepo
                .findByCourse_IdCourseAndCourse_Teacher_IdUser(courseId, teacherId);

        return lessons.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<LessonResponse> searchLessons(String value, GenericResponse response) {
        boolean hasParams = false;

        String titleParam = null;
        if (value != null && !value.trim().isEmpty()) {
            titleParam = value.trim();
            hasParams = true;
        }

        String courseIdParam = null;
        if (value != null && !value.trim().isEmpty()) {
            courseIdParam = value.trim();
            hasParams = true;
        }

        if (!hasParams) {
            response.warning();
            response.listMessage.add("Por favor proporcione al menos un parámetro de búsqueda");
            return java.util.Collections.emptyList();
        }

        List<LessonResponse> result = lessonRepo.searchLessons(titleParam, courseIdParam)
                .stream()
                .map(this::mapToResponse)
                .toList();

        if (result.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron lecciones con los criterios proporcionados");
        } else {
            response.success();
            response.listMessage.add("Búsqueda exitosa");
        }

        return result;
    }
}
