<?php
// api/eventos.php
require_once 'conexao.php';

function responderJSON($dados, $codigoStatus = 200) {
    http_response_code($codigoStatus);
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    // Cabeçalho personalizado "X-Admin-User" e "X-Admin-Pass" para o JS poder enviar
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Admin-User, X-Admin-Pass");
    
    echo json_encode($dados);
    exit;
}

// FUNÇÃO DE VALIDAÇÃO: Bloqueia intrusos nas ações de gravar, editar e deletar
function verificarSeEhAdmin() {
    // Busca as credenciais enviadas pelo JavaScript nos Headers da requisição
    $usuario = $_SERVER['HTTP_X_ADMIN_USER'] ?? '';
    $senha = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';

    // Confere com os dados de login definidos no seu login.js
    if ($usuario !== 'admin' || $senha !== 'admin123') {
        responderJSON(["erro" => "Acesso negado. Apenas administradores podem alterar eventos."], 403);
    }
}

$metodo = $_SERVER['REQUEST_METHOD'];

// IMPORTANTE: Responde requisições de teste que os navegadores fazem automaticamente (Preflight OPTIONS)
if ($metodo === 'OPTIONS') {
    responderJSON(["status" => "OK"]);
}

switch ($metodo) {
    case 'GET':
        // LISTAR: Qualquer um (visitante ou admin) pode ver os eventos no calendário
        $stmt = $pdo->query("SELECT * FROM eventos ORDER BY dataInicioEvento ASC, horarioInicio ASC");
        $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        responderJSON($eventos);    
        print("get");
            
        break;

    case 'POST':
        print("post");

        // Cadastrar ou Editar Evento
        $dados = json_decode(file_get_contents("php://input"), true);
        if (!$dados) {
            responderJSON(["erro" => "Dados inválidos"], 400);
        }

        // Se o ID enviado existir, significa que é uma EDIÇÃO (UPDATE)
        if (isset($dados['id']) && is_numeric($dados['id'])) {
            
            // SEgurança: Só o admin passa se for para EDITAR!
            verificarSeEhAdmin(); 
            
            $sql = "UPDATE eventos SET titulo=?, tipo=?, horarioInicio=?, horarioFim=?, descricao=?, linkIngressos=?, dataInicioEvento=?, dataFimEvento=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $dados['titulo'], $dados['tipo'], $dados['horarioInicio'], $dados['horarioFim'],
                $dados['descricao'], $dados['linkIngressos'], $dados['dataInicioEvento'], $dados['dataFimEvento'], $dados['id']
            ]);
            responderJSON(["sucesso" => true, "mensagem" => "Evento atualizado"]);
        } else {
            // INSERÇÃO (INSERT): Qualquer usuário (visitante) pode cair aqui livremente!
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
        // EXCLUIR: Só o admin passa por aqui!
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