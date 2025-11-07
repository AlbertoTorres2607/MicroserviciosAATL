CREATE DATABASE IF NOT EXISTS authdb;
CREATE DATABASE IF NOT EXISTS enviosdb;

USE authdb;
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  correo VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Usuario demo: correo: demo@demo.com, password: demo 
