-- Adds the chat tables without modifying existing application tables.
-- Apply once against the existing Azure MySQL database.

CREATE TABLE IF NOT EXISTS tconversation (
    idConversation CHAR(36) NOT NULL PRIMARY KEY,
    type ENUM('DIRECT', 'COURSE_SUPPORT') NOT NULL DEFAULT 'DIRECT',
    idCourse CHAR(36) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fkConversationCourse
        FOREIGN KEY (idCourse)
        REFERENCES tcourse(idCourse)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tconversation_participant (
    idParticipant CHAR(36) NOT NULL PRIMARY KEY,
    idConversation CHAR(36) NOT NULL,
    idUser CHAR(36) NOT NULL,
    unreadCount INT NOT NULL DEFAULT 0,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastReadAt TIMESTAMP NULL,

    CONSTRAINT fkParticipantConversation
        FOREIGN KEY (idConversation)
        REFERENCES tconversation(idConversation)
        ON DELETE CASCADE,

    CONSTRAINT fkParticipantUser
        FOREIGN KEY (idUser)
        REFERENCES tuser(idUser)
        ON DELETE CASCADE,

    CONSTRAINT uqConversationUser
        UNIQUE (idConversation, idUser)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tmessage (
    idMessage CHAR(36) NOT NULL PRIMARY KEY,
    idConversation CHAR(36) NOT NULL,
    senderId CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    attachmentUrl VARCHAR(255) NULL,
    status ENUM('SENT', 'DELIVERED', 'READ') NOT NULL DEFAULT 'SENT',
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fkMessageConversation
        FOREIGN KEY (idConversation)
        REFERENCES tconversation(idConversation)
        ON DELETE CASCADE,

    CONSTRAINT fkMessageSender
        FOREIGN KEY (senderId)
        REFERENCES tuser(idUser)
        ON DELETE CASCADE,

    INDEX idx_conv_sent_at (idConversation, sentAt)
) ENGINE=InnoDB;
