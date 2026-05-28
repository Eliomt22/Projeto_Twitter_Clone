-- twitter_clone_aiven.sql — compatível com MySQL 8.0 (Aiven)

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS SESSAO;
DROP TABLE IF EXISTS COMENTARIO;
DROP TABLE IF EXISTS GOSTO;
DROP TABLE IF EXISTS SEGUIDOR;
DROP TABLE IF EXISTS TWEET;
DROP TABLE IF EXISTS UTILIZADOR;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE UTILIZADOR (
    utilizador_id   INT             NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    bio             TEXT,
    foto_perfil     VARCHAR(500),
    data_registo    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_admin        TINYINT(1)      NOT NULL DEFAULT 0,
    ativo           TINYINT(1)      NOT NULL DEFAULT 1,
    CONSTRAINT PK_UTILIZADOR          PRIMARY KEY (utilizador_id),
    CONSTRAINT UQ_UTILIZADOR_username UNIQUE (username),
    CONSTRAINT UQ_UTILIZADOR_email    UNIQUE (email),
    CONSTRAINT CK_UTILIZADOR_is_admin CHECK (is_admin IN (0, 1)),
    CONSTRAINT CK_UTILIZADOR_ativo    CHECK (ativo IN (0, 1))
);

CREATE TABLE TWEET (
    tweet_id        INT             NOT NULL AUTO_INCREMENT,
    conteudo        VARCHAR(280)    NOT NULL,
    data_publicacao TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    utilizador_id   INT             NOT NULL,
    imagem_url      VARCHAR(500),
    CONSTRAINT PK_TWEET            PRIMARY KEY (tweet_id),
    CONSTRAINT FK_TWEET_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CK_TWEET_conteudo   CHECK (CHAR_LENGTH(conteudo) BETWEEN 1 AND 280)
);

-- RI16 (não seguir a si próprio) implementada na aplicação
-- MySQL 8.0 não permite CHECK em colunas usadas em FK com CASCADE
CREATE TABLE SEGUIDOR (
    seguidor_id     INT             NOT NULL,
    seguido_id      INT             NOT NULL,
    data_follow     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_SEGUIDOR            PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT FK_SEGUIDOR_seguidor   FOREIGN KEY (seguidor_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_SEGUIDOR_seguido    FOREIGN KEY (seguido_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE GOSTO (
    utilizador_id   INT             NOT NULL,
    tweet_id        INT             NOT NULL,
    data_gosto      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_GOSTO            PRIMARY KEY (utilizador_id, tweet_id),
    CONSTRAINT FK_GOSTO_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_GOSTO_tweet      FOREIGN KEY (tweet_id)
        REFERENCES TWEET(tweet_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE COMENTARIO (
    comentario_id   INT             NOT NULL AUTO_INCREMENT,
    conteudo        VARCHAR(280)    NOT NULL,
    data_criacao    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tweet_id        INT             NOT NULL,
    utilizador_id   INT             NOT NULL,
    CONSTRAINT PK_COMENTARIO            PRIMARY KEY (comentario_id),
    CONSTRAINT FK_COMENTARIO_tweet      FOREIGN KEY (tweet_id)
        REFERENCES TWEET(tweet_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_COMENTARIO_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE SESSAO (
    sessao_id       INT             NOT NULL AUTO_INCREMENT,
    utilizador_id   INT             NOT NULL UNIQUE,
    token           VARCHAR(500)    NOT NULL,
    data_criacao    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao  DATETIME,
    CONSTRAINT PK_SESSAO            PRIMARY KEY (sessao_id),
    CONSTRAINT FK_SESSAO_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
