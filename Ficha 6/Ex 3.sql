CREATE DATABASE livraria1;
USE livraria1; 

CREATE TABLE leitor(
leitor_id INT PRIMARY KEY,
nome VARCHAR(100),
endereco VARCHAR(50),
cod_postal VARCHAR(50),
localidade VARCHAR(50),
complemento VARCHAR(50)

);

CREATE TABLE editora( 
editora_id INT PRIMARY KEY,
nome VARCHAR(50),
endereco VARCHAR(50),
cod_postal VARCHAR(50)

);

CREATE TABLE palavra_chave( 
palavra_id INT PRIMARY KEY,
palavra VARCHAR(50)

);

CREATE TABLE autor(
autor_id INT PRIMARY KEY,
nome VARCHAR(50),
ddn VARCHAR(50)

);

CREATE TABLE livro(
livro_id INT PRIMARY KEY,
editora_id INT,
isbn VARCHAR(50),
titulo VARCHAR(100),
ano INT,
edicao VARCHAR(50),
quota VARCHAR(50),
FOREIGN KEY (editora_id)
REFERENCES editora(editora_id)

);

CREATE TABLE exemplar(

exemplar_id INT PRIMARY KEY,
livro_id INT,
data_de_aquisicao DATETIME,
FOREIGN KEY (livro_id)
REFERENCES livro(livro_id) 

);

CREATE TABLE livro_autor(
livro_id INT,
autor_id INT,
PRIMARY KEY (livro_id, autor_id),
FOREIGN KEY (livro_id)
REFERENCES livro(livro_id),
FOREIGN KEY (autor_id)
REFERENCES autor(autor_id)

);

CREATE TABLE livro_palavra(
livro_id INT,
palavra_id INT,
PRIMARY KEY (livro_id, palavra_id),
FOREIGN KEY (livro_id)
REFERENCES livro(livro_id),
FOREIGN KEY (palavra_id)
REFERENCES palavra_chave(palavra_id)

);

CREATE TABLE requisisao(
requisisao INT PRIMARY KEY, 
exemplar_id INT,
leitor_id INT,
data_requisisao DATE,
data_prev_entrega DATE,
data_real_entrega DATE,
valor_multa FLOAT,
FOREIGN KEY (exemplar_id)
REFERENCES exemplar(exemplar_id),
FOREIGN KEY (leitor_id)
REFERENCES leitor(leitor_id)

);

INSERT INTO editora (editora_id, nome, endereco, cod_postal) VALUES
(1, 'Lua de Papel', 'Lisboa', 9100),
(2, 'Manuscrito Editora', 'Porto', 9300),
(3, 'Porto Editora', 'S.A. Funchal', 9000),
(4, 'Desassossego', 'Santana', 9200);

INSERT INTO livro (livro_id, editora_id, isbn, titulo, ano, edicao, quota) VALUES
(1, 3, '9789720031280', 'Último Caderno de Lanzarote', 2018, '10-2018', 272),
(2, 1, '9789897224140', 'Areias Brancas', 2018, '07-2018', 232),
(3, 4, '9789898871657', 'Foi Sem Querer Que Te Quis', 2018, '11-2018', 312),
(4, 2, '9789897801037', 'Next Level', 2019, '03-2019', 280),
(5, 3, '9788491392903', 'A Outra Mulher', 2019, '03-2019', 464),
(6, 2, '9789892344379', 'Nobre & Poderoso', 2019, '03-2019', 320),
(7, 2, '9789897103360', 'Coração em Chamas', 2019, '04-2019', 448);

SELECT * FROM editora;

ALTER TABLE requisicao
MODIFY valor_multa DECIMAL(5,2);



