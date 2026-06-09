<?php
// api/eventos.php

// Importa o arquivo que faz a conexão ativa com o banco de dados MySQL
require_once 'conexao.php';

/**
 * Função utilitária para estruturar e enviar as respostas da API para o JavaScript.
 * Define os cabeçalhos de CORS (para permitir requisições de outros locais se necessário),
 * define o formato de saída como JSON e encerra a execução do script de forma limpa.
 */
function responderJSON($dados, $codigoStatus = 200) {
    http_response_code($codigoStatus);
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Admin-User, X-Admin-Pass");
    
    echo json_encode($dados);
    exit;
}

/**
 * Middleware / Função de Segurança.
 * Lê os cabeçalhos personalizados enviados pelo JavaScript para validar se quem está tentando
 * fazer a alteração (Editar ou Deletar) possui credenciais válidas de administrador.
 * Se os dados estiverem incorretos, barra a requisição devolvendo o erro HTTP 403 (Proibido).
 */
function verificarSeEhAdmin() {
    // Busca as credenciais enviadas pelo JavaScript nos Headers da requisição
    $usuario = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
    $senha = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';

    // Confere se as credenciais batem com o perfil master do administrador
    if ($usuario !== 'admin' || $senha !== 'admin123') {
        responderJSON(["erro" => "Acesso negado. Apenas administradores podem alterar eventos."], 403);
    }
}

// Identifica qual o método de requisição HTTP está sendo usado (GET, POST, DELETE ou OPTIONS)
$metodo = $_SERVER['REQUEST_METHOD'];

/**
 * Responde de forma automática às requisições do tipo 'OPTIONS'.
 * Esse é um comportamento padrão que os navegadores realizam (chamado de Preflight)
 * para validar se os métodos e cabeçalhos personalizados da API são seguros para envio.
 */
if ($metodo === 'OPTIONS') {
    responderJSON(["status" => "OK"]);
}

// Direciona o fluxo de dados com base no método recebido
switch ($metodo) {
    
    case 'GET':
        /**
         * AÇÃO: LISTAR EVENTOS
         * Disponível para qualquer usuário (visitantes comuns ou administradores).
         * Consulta a tabela do banco de dados, ordena os eventos por data e horário,
         * transforma em um array associativo e envia de volta para desenhar no calendário.
         */
        $stmt = $pdo->query("SELECT * FROM eventos ORDER BY dataInicioEvento ASC, horarioInicio ASC");
        $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        responderJSON($eventos);    
        break;

    case 'POST':
        /**
         * AÇÃO: CADASTRAR OU EDITAR EVENTO
         * Recebe os dados em formato JSON vindos do corpo da requisição (php://input).
         */
        $dados = json_decode(file_get_contents("php://input"), true);
        if (!$dados) {
            responderJSON(["erro" => "Dados inválidos"], 400);
        }

        // Verifica se a requisição possui um ID numérico para decidir se é uma Edição ou Inserção
        if (isset($dados['id']) && is_numeric($dados['id'])) {
            
            // SEÇÃO DE EDIÇÃO (UPDATE): Exige obrigatoriamente validação de administrador
            verificarSeEhAdmin(); 
            
            $sql = "UPDATE eventos SET titulo=?, tipo=?, horarioInicio=?, horarioFim=?, descricao=?, linkIngressos=?, dataInicioEvento=?, dataFimEvento=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $dados['titulo'], $dados['tipo'], $dados['horarioInicio'], $dados['horarioFim'],
                $dados['descricao'], $dados['linkIngressos'], $dados['dataInicioEvento'], $dados['dataFimEvento'], $dados['id']
            ]);
            responderJSON(["sucesso" => true, "mensagem" => "Evento atualizado"]);
        } else {
            
            // SEÇÃO DE INSERÇÃO (INSERT): Aberto para qualquer visitante cadastrar eventos no sistema
            $sql = "INSERT INTO eventos (titulo, tipo, horarioInicio, horarioFim, descricao, linkIngressos, dataInicioEvento, dataFimEvento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $dados['titulo'], $dados['tipo'], $dados['horarioInicio'], $dados['horarioFim'],
                $dados['descricao'], $dados['linkIngressos'], $dados['dataInicioEvento'], $dados['dataFimEvento']
            ]);
            responderJSON(["sucesso" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        /**
         * AÇÃO: EXCLUIR EVENTO
         * Ação restrita exclusivamente ao perfil de administrador.
         * Captura o ID enviado via parâmetro de URL (ex: api/eventos.php?id=5) e remove o registro correspondente.
         */
        verificarSeEhAdmin(); 

        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            responderJSON(["sucesso" => true]);
        } else {
            responderJSON(["erro" => "ID não fornecido"], 400);
        }
        break;
}