<?php

// API para a conexão, via PHP ao banco de dados

// Pega as credenciais
$host = 'localhost';
$dbname = 'trabsenai';
$username = 'root';
$password = 'admin';

// Realiza a conexão e a inicialização automática do banco/tabela
try {
    // 1. Conecta primeiro apenas ao servidor MySQL (sem especificar o banco)
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Cria o banco de dados caso ele não exista
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8 COLLATE utf8_general_ci");
    
    // 3. Seleciona o banco de dados para uso
    $pdo->exec("USE `$dbname`");

    // 4. Cria a tabela de eventos automaticamente caso ela não exista
    $sqlTabela = "CREATE TABLE IF NOT EXISTS `eventos` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `titulo` VARCHAR(150) NOT NULL,
        `tipo` VARCHAR(50) NOT NULL,
        `horarioInicio` TIME NOT NULL,
        `horarioFim` TIME NOT NULL,
        `descricao` TEXT NULL,
        `linkIngressos` VARCHAR(255) NULL,
        `dataInicioEvento` DATE NOT NULL,
        `dataFimEvento` DATE NOT NULL,
        `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    
    $pdo->exec($sqlTabela);

} catch(PDOException $e) {
    // Retorna o erro em formato JSON caso algo dê muito errado na conexão
    header("Content-Type: application/json");
    echo json_encode(["erro" => "Falha na Conexão/Inicialização: " . $e->getMessage()]);
    exit;
}