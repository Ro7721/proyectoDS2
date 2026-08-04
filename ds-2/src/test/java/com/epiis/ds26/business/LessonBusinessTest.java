package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import com.epiis.ds26.dto.request.LessonRequest;
import com.epiis.ds26.dto.response.LessonResponse;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityLesson;
import com.epiis.ds26.entity.EntityLessonFile;
import com.epiis.ds26.enums.EType;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.LessonFileRepo;
import com.epiis.ds26.repositorie.LessonRepo;

@ExtendWith(MockitoExtension.class)
class LessonBusinessTest {

    @Mock
    private LessonRepo lessonRepo;

    @Mock
    private LessonFileRepo lessonFileRepo;

    @InjectMocks
    private LessonBusiness lessonBusiness;

    private EntityLesson sampleLesson;
    private LessonRequest sampleRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(lessonBusiness, "baseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(lessonBusiness, "storagePath", "target/test-storage");

        EntityCourse course = new EntityCourse();
        course.setIdCourse("course-123");

        sampleLesson = new EntityLesson();
        sampleLesson.setIdLesson("lesson-123");
        sampleLesson.setCourse(course);
        sampleLesson.setTitle("Lesson Title");
        sampleLesson.setDescription("Lesson Description long enough");
        sampleLesson.setType(EType.VIDEO);
        sampleLesson.setContentUrl("video.mp4");
        sampleLesson.setDurationMinutes(10);
        sampleLesson.setLessonOrder(1);
        sampleLesson.setIsFree(false);
        sampleLesson.setCreatedAt(LocalDateTime.now());

        sampleRequest = new LessonRequest();
        sampleRequest.setCourseId("course-123");
        sampleRequest.setTitle("Lesson Title");
        sampleRequest.setDescription("Lesson Description long enough");
        sampleRequest.setType("VIDEO");
        sampleRequest.setContenUrl("video.mp4");
        sampleRequest.setLessonOrder(1);
        sampleRequest.setFree(false);
    }

    @AfterEach
    void cleanUp() {
        // Clean target/test-storage directories if they exist
        try {
            Path path = Paths.get("target/test-storage");
            if (Files.exists(path)) {
                Files.walk(path)
                        .sorted((p1, p2) -> p2.compareTo(p1))
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException ignored) {
            // Teardown directory cleanup exception is safely ignored
        }
    }

    @Test
    void insert_noFiles_success() {
        sampleRequest.setType("PDF");
        when(lessonRepo.findMaxLessonOrderByCourseId("course-123")).thenReturn(0);
        when(lessonRepo.save(any(EntityLesson.class))).thenReturn(sampleLesson);
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void insert_tooManyAdjunctFiles_warning() {
        sampleRequest.setType("PDF");
        GenericResponse response = new GenericResponse();
        MockMultipartFile file = new MockMultipartFile("adj", "adj.pdf", "application/pdf", "data".getBytes());
        List<org.springframework.web.multipart.MultipartFile> adjuncts = List.of(file, file, file, file, file, file);

        EntityLesson result = lessonBusiness.insert(sampleRequest, null, adjuncts, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insert_videoWithMissingFile_warning() {
        sampleRequest.setType("VIDEO");
        sampleRequest.setContenUrl(""); // force file upload required
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insert_videoWithInvalidFormat_warning() {
        sampleRequest.setType("VIDEO");
        sampleRequest.setContenUrl("");
        MockMultipartFile videoFile = new MockMultipartFile("video", "video.txt", "text/plain", "video".getBytes());
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.insert(sampleRequest, videoFile, null, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insert_videoWithValidFormatButFailsExtractDuration_warning() {
        sampleRequest.setType("VIDEO");
        sampleRequest.setContenUrl("");
        MockMultipartFile videoFile = new MockMultipartFile("video", "video.mp4", "video/mp4", "video".getBytes());
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.insert(sampleRequest, videoFile, null, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void insert_validPdfWithAdjunctFiles_success() {
        sampleRequest.setType("PDF");
        when(lessonRepo.findMaxLessonOrderByCourseId("course-123")).thenReturn(0);
        when(lessonRepo.save(any(EntityLesson.class))).thenReturn(sampleLesson);
        MockMultipartFile adjPdf = new MockMultipartFile("adj", "doc.pdf", "application/pdf", "pdfcontent".getBytes());
        MockMultipartFile adjTxt = new MockMultipartFile("adj2", "doc.txt", "text/plain", "txtcontent".getBytes());

        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, List.of(adjPdf, adjTxt), response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void validateLesson_courseIdMissing_warning() {
        sampleRequest.setCourseId("");
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "12345", "abc"})
    void validateLesson_invalidTitle_warning(String invalidTitle) {
        sampleRequest.setTitle(invalidTitle);
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "12345678901", "abc"})
    void validateLesson_invalidDescription_warning(String invalidDescription) {
        sampleRequest.setDescription(invalidDescription);
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
    }

    @Test
    void validateLesson_typeMissing_warning() {
        sampleRequest.setType("");
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
    }

    @Test
    void validateLesson_typeInvalid_warning() {
        sampleRequest.setType("INVALID");
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
    }

    @Test
    void validateLesson_bothFilesAndUrlMissing_warning() {
        sampleRequest.setContenUrl("");
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.insert(sampleRequest, null, null, response);
        assertNull(result);
    }

    @Test
    void deleteLesson_emptyId_error() {
        GenericResponse response = new GenericResponse();
        boolean result = lessonBusiness.deleteLesson("", response);
        assertFalse(result);
        assertEquals("error", response.getType());
    }

    @Test
    void deleteLesson_notExists_warning() {
        when(lessonRepo.findById("les-999")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();
        boolean result = lessonBusiness.deleteLesson("les-999", response);
        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void getLesson_returnsList() {
        when(lessonRepo.findAll()).thenReturn(List.of(sampleLesson));
        List<LessonResponse> list = lessonBusiness.getLesson();
        assertEquals(1, list.size());
    }

    @Test
    void getLessonsByTeacher_returnsList() {
        when(lessonRepo.findByCourse_Teacher_IdUserOrderByCourse_TitleAscLessonOrderAsc("teach-1"))
                .thenReturn(List.of(sampleLesson));
        List<LessonResponse> list = lessonBusiness.getLessonsByTeacher("teach-1");
        assertEquals(1, list.size());
    }

    @Test
    void searchLessons_emptyParams_warning() {
        GenericResponse response = new GenericResponse();
        List<LessonResponse> list = lessonBusiness.searchLessons("", response);
        assertTrue(list.isEmpty());
        assertEquals("warning", response.getType());
    }

    @Test
    void searchLessons_notFound_warning() {
        when(lessonRepo.searchLessons("none", "none")).thenReturn(Collections.emptyList());
        GenericResponse response = new GenericResponse();
        List<LessonResponse> list = lessonBusiness.searchLessons("none", response);
        assertTrue(list.isEmpty());
        assertEquals("warning", response.getType());
    }

    @Test
    void updateLesson_notExists_warning() {
        when(lessonRepo.findById("lesson-123")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();
        EntityLesson result = lessonBusiness.updateLesson("lesson-123", sampleRequest, null, null, response);
        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void updateLesson_success_withoutFiles() {
        when(lessonRepo.findById("lesson-123")).thenReturn(Optional.of(sampleLesson));
        when(lessonRepo.save(any(EntityLesson.class))).thenReturn(sampleLesson);
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.updateLesson("lesson-123", sampleRequest, null, null, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void updateLesson_success_withVideoFileFailsDuration() {
        when(lessonRepo.findById("lesson-123")).thenReturn(Optional.of(sampleLesson));
        MockMultipartFile videoFile = new MockMultipartFile("video", "video.txt", "text/plain", "video".getBytes());
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.updateLesson("lesson-123", sampleRequest, videoFile, null, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void mapToResponse_withFiles_success() {
        EntityLessonFile file1 = new EntityLessonFile();
        file1.setIdFile("file-1");
        file1.setFileName("doc.pdf");
        file1.setFileType(EType.PDF);
        file1.setFileUrl("doc.pdf");
        file1.setFileOrder(1);

        when(lessonFileRepo.findByLesson_IdLessonOrderByFileOrderAsc("lesson-123")).thenReturn(List.of(file1));

        LessonResponse response = lessonBusiness.mapToResponse(sampleLesson);

        assertNotNull(response);
        assertEquals("lesson-123", response.getIdLesson());
        assertEquals(1, response.getFiles().size());
        assertEquals("PDF", response.getFiles().get(0).getFileType());
    }

    @Test
    void mapToResponse_textFileType_success() {
        EntityLessonFile file1 = new EntityLessonFile();
        file1.setIdFile("file-2");
        file1.setFileName("doc.txt");
        file1.setFileType(EType.TEXT);
        file1.setFileUrl("doc.txt");
        file1.setFileOrder(1);

        sampleLesson.setType(EType.PDF);
        when(lessonFileRepo.findByLesson_IdLessonOrderByFileOrderAsc("lesson-123")).thenReturn(List.of(file1));

        LessonResponse response = lessonBusiness.mapToResponse(sampleLesson);

        assertNotNull(response);
        assertEquals(1, response.getFiles().size());
        assertEquals("TEXT", response.getFiles().get(0).getFileType());
    }

    @Test
    void deleteLesson_success() {
        when(lessonRepo.findById("lesson-123")).thenReturn(Optional.of(sampleLesson));
        GenericResponse response = new GenericResponse();

        boolean result = lessonBusiness.deleteLesson("lesson-123", response);

        assertTrue(result);
        assertEquals("success", response.getType());
        verify(lessonRepo).delete(sampleLesson);
    }

    @Test
    void getLessonsByCourseAndTeacher_returnsList() {
        when(lessonRepo.findByCourse_IdCourseAndCourse_Teacher_IdUser("course-123", "teach-1"))
                .thenReturn(List.of(sampleLesson));
        when(lessonFileRepo.findByLesson_IdLessonOrderByFileOrderAsc("lesson-123")).thenReturn(Collections.emptyList());

        List<LessonResponse> list = lessonBusiness.getLessonsByCourseAndTeacher("course-123", "teach-1");

        assertEquals(1, list.size());
    }

    @Test
    void searchLessons_found_success() {
        when(lessonRepo.searchLessons("title", "title")).thenReturn(List.of(sampleLesson));
        when(lessonFileRepo.findByLesson_IdLessonOrderByFileOrderAsc("lesson-123")).thenReturn(Collections.emptyList());
        GenericResponse response = new GenericResponse();

        List<LessonResponse> list = lessonBusiness.searchLessons("title", response);

        assertFalse(list.isEmpty());
        assertEquals("success", response.getType());
    }

    @Test
    void updateLesson_withAdjunctFiles_success() {
        when(lessonRepo.findById("lesson-123")).thenReturn(Optional.of(sampleLesson));
        when(lessonRepo.save(any(EntityLesson.class))).thenReturn(sampleLesson);
        MockMultipartFile adjPdf = new MockMultipartFile("adj", "doc.pdf", "application/pdf", "pdfcontent".getBytes());
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.updateLesson("lesson-123", sampleRequest, null, List.of(adjPdf), response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void updateLesson_invalidType_returnsNull() {
        sampleRequest.setType("");
        GenericResponse response = new GenericResponse();

        EntityLesson result = lessonBusiness.updateLesson("lesson-123", sampleRequest, null, null, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }
}
