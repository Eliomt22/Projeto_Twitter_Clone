CREATE DATABASE livraria;
USE livraria;

CREATE TABLE utilizador (
    utilizador_id INT PRIMARY KEY,
    username VARCHAR(200),
    criado_a DATETIME,
    actualizado_a DATETIME
);

CREATE TABLE autor (
    autor_id INT PRIMARY KEY,
    nome VARCHAR(255),
    apelido VARCHAR(255),
    criado_a DATETIME,
    actualizado_a DATETIME
);

CREATE TABLE livro (
    livro_id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    autor_id INT NOT NULL,
    ano_publicacao INT NOT NULL,
    genero VARCHAR(255) NOT NULL,
    criado_a DATETIME NULL,
    actualizado_a DATETIME NULL,
    CONSTRAINT FK_livro_autor 
        FOREIGN KEY (autor_id) 
        REFERENCES autor(autor_id)
);

CREATE TABLE favorito (
    utilizador_id INT,
    livro_id INT,
    criado_a TIMESTAMP,
    actualizado_a TIMESTAMP,
    PRIMARY KEY (utilizador_id, livro_id),
    FOREIGN KEY (utilizador_id) REFERENCES utilizador(utilizador_id),
    FOREIGN KEY (livro_id) REFERENCES livro(livro_id)
);