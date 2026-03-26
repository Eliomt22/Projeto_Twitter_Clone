CREATE DATABASE musica;
USE musica; 

CREATE TABLE cantor (
    cantor_id INT PRIMARY KEY,
    nome VARCHAR(45)
);

CREATE TABLE album (
    album_id INT PRIMARY KEY,
    titulo VARCHAR(45),
    cantor_id INT,
    FOREIGN KEY (cantor_id)
    REFERENCES cantor(cantor_id)
);

CREATE TABLE faixa (
    faixa_id INT PRIMARY KEY,
    nome_musica VARCHAR(45),
    album_id INT,
    FOREIGN KEY (album_id) 
    REFERENCES album(album_id)
);

CREATE TABLE utilizador (
    utilizador_id INT PRIMARY KEY,
    nome VARCHAR(100),
    genero CHAR(1),
    nacionalidade VARCHAR(45)
);

CREATE TABLE faixa_preferida (
    faixa_id INT,
    utilizador_id INT,
    pontuacao DOUBLE,
    PRIMARY KEY (faixa_id, utilizador_id),
    FOREIGN KEY (faixa_id) 
    REFERENCES faixa(faixa_id),
    FOREIGN KEY (utilizador_id) 
    REFERENCES utilizador(utilizador_id)
);

INSERT INTO utilizador (utilizador_id, nome, genero, nacionalidade) VALUES
(1, 'Abel', 'M', 'Portugal'),
(2, 'Carla', 'F', 'Espanha'),
(3, 'Daniel', 'M', 'Inglaterra'),
(4, 'Susana', 'F', 'Portugal');

INSERT INTO cantor (cantor_id, nome) VALUES
(1, 'Tony Carreira'),
(2, 'BossAC');

