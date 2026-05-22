CREATE DATABASE IF NOT EXISTS twitter_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE twitter_clone;

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
    data_registo    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- RI13: PK composta (seguidor_id, seguido_id)
-- RI14: seguidor_id FK para UTILIZADOR
-- RI15: seguido_id FK para UTILIZADOR
-- RI16: um utilizador não pode seguir-se a si próprio
-- RI17: data_follow DEFAULT CURRENT_TIMESTAMP
CREATE TABLE SEGUIDOR (
    seguidor_id     INT             NOT NULL,
    seguido_id      INT             NOT NULL,
    data_follow     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- relação 1:N com TWEET (um tweet tem vários comentários)
-- RI22: comentario_id PK auto-incrementada
-- RI23: conteudo NOT NULL, entre 1 e 280 caracteres
-- RI24: tweet_id FK para TWEET
-- RI25: utilizador_id FK para UTILIZADOR
-- RI26: CASCADE ao apagar tweet ou utilizador
CREATE TABLE COMENTARIO (
    comentario_id   INT             NOT NULL AUTO_INCREMENT,
    conteudo        VARCHAR(280)    NOT NULL,
    data_criacao    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
        ON UPDATE CASCADE,
    CONSTRAINT CK_COMENTARIO_conteudo   CHECK (CHAR_LENGTH(conteudo) BETWEEN 1 AND 280)
);

-- relação 1:1 com UTILIZADOR (cada utilizador tem no máximo uma sessão activa)
-- RI27: sessao_id PK auto-incrementada
-- RI28: utilizador_id UNIQUE garante a relação 1:1
-- RI29: token NOT NULL
-- RI30: utilizador_id FK para UTILIZADOR com CASCADE
CREATE TABLE SESSAO (
    sessao_id       INT             NOT NULL AUTO_INCREMENT,
    utilizador_id   INT             NOT NULL UNIQUE,
    token           VARCHAR(500)    NOT NULL,
    data_criacao    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao  DATETIME,
    CONSTRAINT PK_SESSAO            PRIMARY KEY (sessao_id),
    CONSTRAINT FK_SESSAO_utilizador FOREIGN KEY (utilizador_id)
        REFERENCES UTILIZADOR(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- OPERAÇÕES CRUD
-- ============================================================


-- CREATE

-- C1: registar novo utilizador
INSERT INTO UTILIZADOR (username, email, password_hash, bio)
VALUES ('novo_user', 'novouser@email.pt', '$2b$10$hash...', 'Bio do utilizador');

-- C2: publicar tweet sem imagem
INSERT INTO TWEET (conteudo, utilizador_id)
VALUES ('O meu primeiro tweet!', 1);

-- C3: publicar tweet com imagem
INSERT INTO TWEET (conteudo, utilizador_id, imagem_url)
VALUES ('Tweet com imagem', 1, 'https://exemplo.com/imagem.png');

-- C4: seguir utilizador
INSERT INTO SEGUIDOR (seguidor_id, seguido_id)
VALUES (2, 1);

-- C5: dar gosto a um tweet
INSERT INTO GOSTO (utilizador_id, tweet_id)
VALUES (2, 1);

-- C6: adicionar comentário a um tweet
INSERT INTO COMENTARIO (conteudo, tweet_id, utilizador_id)
VALUES ('Bom tweet!', 1, 2);

-- C7: criar sessão após login (upsert — substitui se já existir)
INSERT INTO SESSAO (utilizador_id, token, data_expiracao)
VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', DATE_ADD(NOW(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE
    token = VALUES(token),
    data_criacao = NOW(),
    data_expiracao = VALUES(data_expiracao);


-- READ

-- R1: feed do utilizador — tweets de quem segue, mais recentes primeiro
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    t.imagem_url,
    t.data_publicacao,
    COUNT(DISTINCT g.utilizador_id)                              AS total_gostos,
    (SELECT COUNT(*) FROM COMENTARIO c WHERE c.tweet_id = t.tweet_id) AS total_comentarios
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
INNER JOIN SEGUIDOR s   ON s.seguido_id = t.utilizador_id
LEFT  JOIN GOSTO g      ON g.tweet_id = t.tweet_id
WHERE s.seguidor_id = 1
  AND u.ativo = 1
GROUP BY t.tweet_id, u.username, t.conteudo, t.imagem_url, t.data_publicacao
ORDER BY t.data_publicacao DESC;

-- R2: perfil de utilizador com totais
SELECT
    u.utilizador_id,
    u.username,
    u.bio,
    u.foto_perfil,
    u.data_registo,
    (SELECT COUNT(*) FROM TWEET     WHERE utilizador_id = u.utilizador_id) AS total_tweets,
    (SELECT COUNT(*) FROM SEGUIDOR  WHERE seguido_id    = u.utilizador_id) AS total_seguidores,
    (SELECT COUNT(*) FROM SEGUIDOR  WHERE seguidor_id   = u.utilizador_id) AS total_seguindo
FROM UTILIZADOR u
WHERE u.username = 'admin';

-- R3: top 5 tweets com mais gostos
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    COUNT(g.tweet_id) AS total_gostos
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
LEFT  JOIN GOSTO g      ON g.tweet_id = t.tweet_id
GROUP BY t.tweet_id, u.username, t.conteudo
ORDER BY total_gostos DESC
LIMIT 5;

-- R4: seguidores de um utilizador
SELECT
    u.utilizador_id,
    u.username,
    u.bio,
    s.data_follow
FROM UTILIZADOR u
INNER JOIN SEGUIDOR s ON s.seguidor_id = u.utilizador_id
WHERE s.seguido_id = 1
ORDER BY s.data_follow DESC;

-- R5: verificar se utilizador A segue utilizador B
SELECT EXISTS (
    SELECT 1 FROM SEGUIDOR
    WHERE seguidor_id = 1 AND seguido_id = 2
) AS ja_segue;

-- R6: backoffice — todos os utilizadores com total de tweets
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

-- R7: backoffice — todos os tweets com autor e gostos
SELECT
    t.tweet_id,
    u.username,
    t.conteudo,
    t.imagem_url,
    t.data_publicacao,
    COUNT(g.tweet_id) AS total_gostos
FROM TWEET t
INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
LEFT  JOIN GOSTO g      ON g.tweet_id = t.tweet_id
GROUP BY t.tweet_id, u.username, t.conteudo, t.imagem_url, t.data_publicacao
ORDER BY t.data_publicacao DESC;

-- R8: comentários de um tweet com dados do autor
SELECT
    c.comentario_id,
    c.conteudo,
    c.data_criacao,
    u.utilizador_id,
    u.username,
    u.foto_perfil
FROM COMENTARIO c
INNER JOIN UTILIZADOR u ON c.utilizador_id = u.utilizador_id
WHERE c.tweet_id = 1
ORDER BY c.data_criacao DESC;

-- R9: sessão activa de um utilizador
SELECT
    s.sessao_id,
    s.token,
    s.data_criacao,
    s.data_expiracao,
    u.username
FROM SESSAO s
INNER JOIN UTILIZADOR u ON s.utilizador_id = u.utilizador_id
WHERE s.utilizador_id = 1;

-- R10: todos os comentários de um utilizador
SELECT
    c.comentario_id,
    c.conteudo,
    c.data_criacao,
    t.tweet_id,
    t.conteudo AS conteudo_tweet
FROM COMENTARIO c
INNER JOIN TWEET t ON c.tweet_id = t.tweet_id
WHERE c.utilizador_id = 1
ORDER BY c.data_criacao DESC;


-- UPDATE

-- U1: atualizar bio
UPDATE UTILIZADOR
SET bio = 'Nova bio actualizada'
WHERE utilizador_id = 1;

-- U2: atualizar foto de perfil
UPDATE UTILIZADOR
SET foto_perfil = 'https://exemplo.com/foto.jpg'
WHERE utilizador_id = 1;

-- U3: desativar utilizador (soft delete)
UPDATE UTILIZADOR
SET ativo = 0
WHERE utilizador_id = 2;

-- U4: reativar utilizador
UPDATE UTILIZADOR
SET ativo = 1
WHERE utilizador_id = 2;

-- U5: editar conteúdo de um tweet
UPDATE TWEET
SET conteudo = 'Tweet editado!'
WHERE tweet_id = 1 AND utilizador_id = 1;

-- U6: promover utilizador a administrador
UPDATE UTILIZADOR
SET is_admin = 1
WHERE utilizador_id = 2;

-- U7: atualizar password
UPDATE UTILIZADOR
SET password_hash = '$2b$10$novoHash...'
WHERE utilizador_id = 1;

-- U8: editar comentário
UPDATE COMENTARIO
SET conteudo = 'Comentário editado!'
WHERE comentario_id = 1 AND utilizador_id = 2;

-- U9: renovar token de sessão
UPDATE SESSAO
SET token = 'novoToken...', data_expiracao = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE utilizador_id = 1;


-- DELETE

-- D1: apagar tweet pelo autor
DELETE FROM TWEET
WHERE tweet_id = 1 AND utilizador_id = 1;

-- D2: deixar de seguir utilizador
DELETE FROM SEGUIDOR
WHERE seguidor_id = 2 AND seguido_id = 1;

-- D3: retirar gosto a um tweet
DELETE FROM GOSTO
WHERE utilizador_id = 2 AND tweet_id = 1;

-- D4: apagar utilizador (cascade: apaga tweets, gostos, seguidores, comentários, sessão)
DELETE FROM UTILIZADOR
WHERE utilizador_id = 3;

-- D5: apagar tweet pelo administrador
DELETE FROM TWEET
WHERE tweet_id = 5;

-- D6: apagar comentário pelo autor
DELETE FROM COMENTARIO
WHERE comentario_id = 1 AND utilizador_id = 2;

-- D7: apagar comentário pelo administrador
DELETE FROM COMENTARIO
WHERE comentario_id = 2;

-- D8: terminar sessão (logout)
DELETE FROM SESSAO
WHERE utilizador_id = 1;
