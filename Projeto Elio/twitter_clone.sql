CREATE DATABASE IF NOT EXISTS twitter_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE twitter_clone;

-- UTILIZADOR
-- RI1: utilizador_id é chave primária, auto-incrementada
-- RI2: username é único e NOT NULL (máx. 50 caracteres)
-- RI3: email é único e NOT NULL (máx. 100 caracteres)
-- RI4: password_hash NOT NULL
-- RI5: data_registo assume CURRENT_TIMESTAMP por omissão
-- RI6: is_admin assume 0 por omissão; aceita apenas 0 ou 1
-- RI7: ativo assume 1 por omissão; aceita apenas 0 ou 1
CREATE TABLE UTILIZADOR (
    utilizador_id   INT             NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    bio             TEXT,
    foto_perfil     VARCHAR(500),
    data_registo    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_admin        TINYINT(1)      NOT NULL DEFAULT 0,
    ativo           TINYINT(1)      NOT NULL DEFAULT 1,
    CONSTRAINT PK_UTILIZADOR          PRIMARY KEY (utilizador_id),
    CONSTRAINT UQ_UTILIZADOR_username UNIQUE (username),
    CONSTRAINT UQ_UTILIZADOR_email    UNIQUE (email),
    CONSTRAINT CK_UTILIZADOR_is_admin CHECK (is_admin IN (0, 1)),
    CONSTRAINT CK_UTILIZADOR_ativo    CHECK (ativo IN (0, 1))
);

-- TWEET
-- RI8:  tweet_id é chave primária, auto-incrementada
-- RI9:  conteudo NOT NULL, entre 1 e 280 caracteres
-- RI10: data_publicacao assume CURRENT_TIMESTAMP por omissão
-- RI11: utilizador_id é chave estrangeira para UTILIZADOR
-- RI12: ao apagar utilizador, os seus tweets são apagados (CASCADE)
CREATE TABLE TWEET (
    tweet_id        INT             NOT NULL AUTO_INCREMENT,
    conteudo        VARCHAR(280)    NOT NULL,
    data_publicacao DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    utilizador_id   INT             NOT NULL,
    imagem_url      VARCHAR(500),
    CONSTRAINT PK_TWEET            PRIMARY KEY (tweet_id),
    CONSTRAINT FK_TWEET_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CK_TWEET_conteudo   CHECK (CHAR_LENGTH(conteudo) BETWEEN 1 AND 280)
);

-- SEGUIDOR
-- RI13: (seguidor_id, seguido_id) é chave primária composta
-- RI14: seguidor_id é chave estrangeira para UTILIZADOR
-- RI15: seguido_id é chave estrangeira para UTILIZADOR
-- RI16: um utilizador não pode seguir-se a si próprio
-- RI17: data_follow assume CURRENT_TIMESTAMP por omissão
CREATE TABLE SEGUIDOR (
    seguidor_id     INT             NOT NULL,
    seguido_id      INT             NOT NULL,
    data_follow     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_SEGUIDOR          PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT FK_SEGUIDOR_seguidor FOREIGN KEY (seguidor_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_SEGUIDOR_seguido  FOREIGN KEY (seguido_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CK_SEGUIDOR_autofollow CHECK (seguidor_id <> seguido_id)
);

-- GOSTO
-- RI18: (utilizador_id, tweet_id) é chave primária composta
-- RI19: utilizador_id é chave estrangeira para UTILIZADOR
-- RI20: tweet_id é chave estrangeira para TWEET
-- RI21: data_gosto assume CURRENT_TIMESTAMP por omissão
CREATE TABLE GOSTO (
    utilizador_id   INT             NOT NULL,
    tweet_id        INT             NOT NULL,
    data_gosto      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
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


-- OPERAÇÕES CRUD


-- CREATE

-- C1: Registar novo utilizador
INSERT INTO UTILIZADOR (username, email, password_hash, bio)
VALUES ('novo_user', 'novouser@email.pt', '$2b$10$hash...', 'Bio do utilizador');

-- C2: Publicar tweet sem imagem
INSERT INTO TWEET (conteudo, utilizador_id)
VALUES ('O meu primeiro tweet!', 1);

-- C3: Publicar tweet com imagem
INSERT INTO TWEET (conteudo, utilizador_id, imagem_url)
VALUES ('Tweet com imagem', 1, 'https://exemplo.com/imagem.png');

-- C4: Seguir utilizador
INSERT INTO SEGUIDOR (seguidor_id, seguido_id)
VALUES (2, 1);

-- C5: Dar gosto a um tweet
INSERT INTO GOSTO (utilizador_id, tweet_id)
VALUES (2, 1);


-- READ

-- R1: Feed do utilizador - tweets de quem segue, ordem cronológica inversa
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    t.imagem_url,
    t.data_publicacao,
    COUNT(g.tweet_id) AS total_gostos
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
INNER JOIN SEGUIDOR s ON s.seguido_id = t.utilizador_id
LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
WHERE s.seguidor_id = 1
GROUP BY t.tweet_id, u.username, t.conteudo, t.imagem_url, t.data_publicacao
ORDER BY t.data_publicacao DESC;

-- R2: Perfil de utilizador com contagem de tweets, seguidores e seguidos
SELECT
    u.utilizador_id,
    u.username,
    u.bio,
    u.foto_perfil,
    u.data_registo,
    (SELECT COUNT(*) FROM TWEET    WHERE utilizador_id = u.utilizador_id) AS total_tweets,
    (SELECT COUNT(*) FROM SEGUIDOR WHERE seguido_id    = u.utilizador_id) AS total_seguidores,
    (SELECT COUNT(*) FROM SEGUIDOR WHERE seguidor_id   = u.utilizador_id) AS total_seguindo
FROM UTILIZADOR u
WHERE u.username = 'admin';

-- R3: Top 5 tweets com mais gostos
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    COUNT(g.tweet_id) AS total_gostos
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
GROUP BY t.tweet_id, u.username, t.conteudo
ORDER BY total_gostos DESC
LIMIT 5;

-- R4: Listar seguidores de um utilizador
SELECT
    u.utilizador_id,
    u.username,
    u.bio,
    s.data_follow
FROM UTILIZADOR u
INNER JOIN SEGUIDOR s ON s.seguidor_id = u.utilizador_id
WHERE s.seguido_id = 1
ORDER BY s.data_follow DESC;

-- R5: Verificar se utilizador A segue utilizador B
SELECT EXISTS (
    SELECT 1 FROM SEGUIDOR
    WHERE seguidor_id = 1 AND seguido_id = 2
) AS ja_segue;

-- R6: Backoffice - listar todos os utilizadores
SELECT
    u.utilizador_id,
    u.username,
    u.email,
    u.is_admin,
    u.ativo,
    u.data_registo,
    COUNT(t.tweet_id) AS total_tweets
FROM UTILIZADOR u
LEFT JOIN TWEET t ON t.utilizador_id = u.utilizador_id
GROUP BY u.utilizador_id, u.username, u.email, u.is_admin, u.ativo, u.data_registo
ORDER BY u.data_registo DESC;

-- R7: Backoffice - listar todos os tweets com autor
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    t.imagem_url,
    t.data_publicacao,
    COUNT(g.tweet_id) AS total_gostos
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
GROUP BY t.tweet_id, u.username, t.conteudo, t.imagem_url, t.data_publicacao
ORDER BY t.data_publicacao DESC;


-- UPDATE

-- U1: Atualizar bio
UPDATE UTILIZADOR
SET bio = 'Nova bio atualizada'
WHERE utilizador_id = 1;

-- U2: Atualizar foto de perfil
UPDATE UTILIZADOR
SET foto_perfil = 'https://exemplo.com/foto.jpg'
WHERE utilizador_id = 1;

-- U3: Desativar utilizador (soft delete)
UPDATE UTILIZADOR
SET ativo = 0
WHERE utilizador_id = 2;

-- U4: Reativar utilizador
UPDATE UTILIZADOR
SET ativo = 1
WHERE utilizador_id = 2;

-- U5: Editar conteúdo de um tweet pelo autor
UPDATE TWEET
SET conteudo = 'Tweet editado!'
WHERE tweet_id = 1 AND utilizador_id = 1;

-- U6: Promover utilizador a administrador
UPDATE UTILIZADOR
SET is_admin = 1
WHERE utilizador_id = 2;

-- U7: Atualizar password
UPDATE UTILIZADOR
SET password_hash = '$2b$10$novoHash...'
WHERE utilizador_id = 1;


-- DELETE

-- D1: Apagar tweet pelo autor
DELETE FROM TWEET
WHERE tweet_id = 1 AND utilizador_id = 1;

-- D2: Deixar de seguir utilizador
DELETE FROM SEGUIDOR
WHERE seguidor_id = 2 AND seguido_id = 1;

-- D3: Retirar gosto a um tweet
DELETE FROM GOSTO
WHERE utilizador_id = 2 AND tweet_id = 1;

-- D4: Apagar utilizador em cascata (apaga também tweets, gostos e seguidores)
DELETE FROM UTILIZADOR
WHERE utilizador_id = 3;

-- D5: Apagar todos os tweets de um utilizador
DELETE FROM TWEET
WHERE utilizador_id = 3;

-- D6: Apagar tweet pelo administrador
DELETE FROM TWEET
WHERE tweet_id = 5;

-- D7: Remover todos os gostos de um tweet
DELETE FROM GOSTO
WHERE tweet_id = 5;