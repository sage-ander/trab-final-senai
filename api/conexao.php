<?php

//API para a conexão, via PHP ao banco de dados

//Pega as credenciais
$host= 'localhost';
$dbname= 'trabsenai';
$username= 'root';
$password= 'Sen@i2026pw';

//Realiza a conexão, via PHP, ao banco de dados
try{
    $pdo= new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e){
    echo json_encode(["erro"=>"Falha na Conexão: " . $e->getMessage()]);
    exit;
}