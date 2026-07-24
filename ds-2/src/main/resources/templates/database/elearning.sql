-- =======================
-- USERS(Usuario)
-- =======================
CREATE TABLE tuser (
    idUser CHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(80) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ROLE_STUDENT','ROLE_TEACHER', 'ROLE_ADMIN') NOT NULL,
    isActive BOOLEAN,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =======================
-- CATEGORIES(Categorias)
-- =======================
CREATE TABLE tcategory (
    idCategory CHAR(36) PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- =======================
-- COURSES(Cursos)
-- =======================
CREATE TABLE tcourse (
    idCourse CHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    coverImage VARCHAR(255) NULL,
    level ENUM('BASIC','INTERMEDIATE','ADVANCED') DEFAULT 'BASIC',
    price DECIMAL(8,2) DEFAULT 0.00,
    status ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
    teacherId CHAR(36) NOT NULL,
    categoryId CHAR(36) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fkCourseTeacher 
    FOREIGN KEY (teacherId)
    REFERENCES tuser(idUser)
    ON DELETE CASCADE,

    CONSTRAINT fkCourseCategory
    FOREIGN KEY (categoryId)
    REFERENCES tcategory(idCategory)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =======================
-- LESSONS(Lecciones)
-- =======================
CREATE TABLE tlesson (
    idLesson CHAR(36) PRIMARY KEY,
    courseId CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    type ENUM('VIDEO','PDF','TEXT') DEFAULT 'VIDEO',
    contentUrl VARCHAR(255) NOT NULL,
    durationMinutes INT DEFAULT 0,
    lessonOrder INT NOT NULL,
    isFree BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fkLessonCourse 
    FOREIGN KEY (courseId)
    REFERENCES tcourse(idCourse)
    ON DELETE CASCADE,

    UNIQUE KEY uqCourseOrder (courseId, lessonOrder)
) ENGINE=InnoDB;
-- ========================
-- TLESSON_FILE (nueva)
-- ========================
CREATE TABLE tlessonfile (
    idFile      CHAR(36) PRIMARY KEY,
    lessonId    CHAR(36) NOT NULL,
    fileName    VARCHAR(150) NOT NULL,
    fileUrl     VARCHAR(255) NOT NULL,
    fileType    ENUM('VIDEO','PDF','TEXT') NOT NULL,
    fileOrder   TINYINT NOT NULL DEFAULT 1,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fkFileLession
        FOREIGN KEY (lessonId)
        REFERENCES tlesson(idLesson)
        ON DELETE CASCADE,

    CONSTRAINT chkFileOrder
        CHECK (fileOrder BETWEEN 1 AND 5)
) ENGINE=InnoDB;
-- =======================
-- ENROLLMENTS(Inscripciones)
-- =======================
CREATE TABLE tenrollment (
    idEnrollment CHAR(36) PRIMARY KEY,
    studentId CHAR(36) NOT NULL,
    courseId CHAR(36) NOT NULL,
    enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastAccess TIMESTAMP NULL,
    totalProgress TINYINT DEFAULT 0 
        CHECK(totalProgress BETWEEN 0 AND 100),
    isCompleted BOOLEAN DEFAULT FALSE,
    UNIQUE KEY uqStudentCourse (studentId, courseId),

    CONSTRAINT fkEnrollStudent 
    FOREIGN KEY (studentId)
    REFERENCES tuser(idUser)
    ON DELETE CASCADE,
    CONSTRAINT fkEnrollCourse 
    FOREIGN KEY (courseId)
    REFERENCES tcourse(idCourse)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =======================
-- LESSON PROGRESS(Progreso de lecciones)
-- =======================
CREATE TABLE lesson_progress (
    idProgress CHAR(36) PRIMARY KEY,
    enrollmentId CHAR(36) NOT NULL,
    lessonId CHAR(36) NOT NULL,
    isCompleted BOOLEAN DEFAULT FALSE,
    watchedPercentage TINYINT DEFAULT 0 
        CHECK(watchedPercentage BETWEEN 0 AND 100),
    
    lastPositionSeconds INT DEFAULT 0,
    completedAt TIMESTAMP NULL,
    UNIQUE KEY uqEnrollLesson (enrollmentId, lessonId),
    
    CONSTRAINT fkProgressEnrollment 
    FOREIGN KEY (enrollmentId)
    REFERENCES tenrollment(idEnrollment)
    ON DELETE CASCADE,

    CONSTRAINT fkProgressLesson 
    FOREIGN KEY (lessonId)
    REFERENCES tlesson(idLesson)
    ON DELETE CASCADE
) ENGINE=InnoDB;