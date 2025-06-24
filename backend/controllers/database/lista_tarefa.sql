CREATE DATABASE IF NOT EXISTS `facsenac` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `facsenac`;

CREATE TABLE tarefas (
    idTarefa INT AUTO_INCREMENT PRIMARY KEY,
    Descricao VARCHAR(254) NOT NULL,
    TimestampInclusao DATETIME,
    TimestampPrazo DATETIME,
    TimestampRealizacao DATETIME,
    TimestampExclusao DATETIME
);