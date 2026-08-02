package com.epiis.ds26.entity;

import java.time.LocalDateTime;

import com.epiis.ds26.enums.EType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tlessonfile")
@Data
@Getter
@Setter
public class EntityLessonFile {
    @Id
    @Column(name = "idFile")
    private String idFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId", nullable = false)
    private EntityLesson lesson;

    @Column(name = "fileName")
    private String fileName;

    @Column(name = "fileUrl")
    private String fileUrl;

    @Column(name = "fileType")
    @Enumerated(EnumType.STRING)
    private EType fileType;

    @Column(name = "fileOrder")
    private int fileOrder;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

}
