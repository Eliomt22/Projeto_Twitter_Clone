-- twitter_clone_import.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS GOSTO;
DROP TABLE IF EXISTS SEGUIDOR;
DROP TABLE IF EXISTS TWEET;
DROP TABLE IF EXISTS UTILIZADOR;

SET FOREIGN_KEY_CHECKS = 1;

-- RI1: utilizador_id PK auto-incrementada
-- RI2: username único e NOT NULL
-- RI3: email único e NOT NULL
-- RI4: password_hash NOT NULL
-- RI5: data_registo DEFAULT CURRENT_TIMESTAMP
-- RI6: is_admin DEFAULT 0, só aceita 0 ou 1
-- RI7: ativo DEFAULT 1, só aceita 0 ou 1
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

-- RI8:  tweet_id PK auto-incrementada
-- RI9:  conteudo NOT NULL, entre 1 e 280 caracteres
-- RI10: data_publicacao DEFAULT CURRENT_TIMESTAMP
-- RI11: utilizador_id FK para UTILIZADOR
-- RI12: CASCADE ao apagar utilizador
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

-- RI13: PK composta (seguidor_id, seguido_id)
-- RI14: seguidor_id FK para UTILIZADOR
-- RI15: seguido_id FK para UTILIZADOR
-- RI16: um utilizador não pode seguir-se a si próprio
-- RI17: data_follow DEFAULT CURRENT_TIMESTAMP
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
        ON UPDATE CASCADE,
    CONSTRAINT CK_SEGUIDOR_autofollow CHECK (seguidor_id <> seguido_id)
);

-- RI18: PK composta (utilizador_id, tweet_id)
-- RI19: utilizador_id FK para UTILIZADOR
-- RI20: tweet_id FK para TWEET
-- RI21: data_gosto DEFAULT CURRENT_TIMESTAMP
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

-- relação 1:N com TWEET (um tweet tem vários comentários)
DROP TABLE IF EXISTS COMENTARIO;
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

-- relação 1:1 com UTILIZADOR (cada utilizador tem no máximo uma sessão activa)
DROP TABLE IF EXISTS SESSAO;
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