// ============================================================
// FORMULARIO.JS - Lógica do formulário de registro de eventos
// CORRIGIDO para localStorage persistente
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Formulário iniciado');
    
    // ========== REFERÊNCIAS DOS ELEMENTOS (IDs CORRETOS do HTML) ==========
    const form = document.getElementById('eventoForm');
    const tituloInput = document.getElementById('titulo');
    const tipoEventoSelect = document.getElementById('tipo');
    const horarioInput = document.getElementById('horario');
    const descricaoTextarea = document.getElementById('descricao');
    const linkIngressosInput = document.getElementById('linkIngressos');
    const dataEventoInput = document.getElementById('dataEvento');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    const erroDataFim = document.getElementById('errorDataFim');
    const erroTitulo = document.getElementById('errorTitulo');
    const erroLink = document.getElementById('errorLink');
    const btnVoltar = document.getElementById('btnVoltar');
    
    // Elementos de upload (IDs CORRETOS do HTML)
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('imagem');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const btnProcurar = document.getElementById('btnProcurar');
    const btnAlterar = document.getElementById('btnAlterar');
    const btnRemover = document.getElementById('btnRemover');
    const nomeArquivo = document.getElementById('nomeArquivo');
    
    let imagemAtual = null;
    
    // Esconder erros inicialmente
    if (erroTitulo) erroTitulo.style.display = 'none';
    if (erroLink) erroLink.style.display = 'none';
    
    // Esconder preview inicialmente
    if (previewContainer) previewContainer.style.display = 'none';
    
    // ========== FUNÇÃO PARA MOSTRAR PRÉ-VISUALIZAÇÃO ==========
    function mostrarPreview(src) {
        if (src && previewImg && previewContainer && dropArea) {
            previewImg.src = src;
            previewContainer.style.display = 'block';
            if (dropArea) dropArea.style.display = 'none';
        } else if (dropArea && previewContainer) {
            previewContainer.style.display = 'none';
            if (dropArea) dropArea.style.display = 'block';
        }
    }
    
    // ========== FUNÇÃO PARA LIMPAR IMAGEM ==========
    function limparImagem() {
        imagemAtual = null;
        if (fileInput) fileInput.value = '';
        if (nomeArquivo) nomeArquivo.textContent = 'Nenhum arquivo selecionado.';
        mostrarPreview(null);
    }
    
    // ========== FUNÇÃO PARA PROCESSAR ARQUIVO ==========
    function processarArquivo(file) {
        if (!file) return false;
        
        console.log('Processando arquivo:', file.name);
        
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato não suportado. Use PNG, JPG, JPEG, GIF ou WEBP.');
            return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Imagem muito grande. Máximo 5MB.');
            return false;
        }
        
        if (nomeArquivo) nomeArquivo.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagemAtual = e.target.result;
            mostrarPreview(imagemAtual);
            console.log('Imagem carregada com sucesso!');
        };
        reader.onerror = function() {
            alert('Erro ao ler o arquivo.');
        };
        reader.readAsDataURL(file);
        return true;
    }
    
    // ========== EVENTOS DE DRAG AND DROP ==========
    if (dropArea) {
        dropArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropArea.classList.add('drag-over');
        });
        
        dropArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
        });
        
        dropArea.addEventListener('drop', function(e) {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processarArquivo(files[0]);
            }
        });
        
        dropArea.addEventListener('click', function(e) {
            if (e.target === btnProcurar) return;
            if (fileInput) fileInput.click();
        });
    }
    
    if (btnProcurar) {
        btnProcurar.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                processarArquivo(e.target.files[0]);
            }
        });
    }
    
    if (btnAlterar) {
        btnAlterar.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    if (btnRemover) {
        btnRemover.addEventListener('click', function() {
            limparImagem();
        });
    }
    
    // ========== FUNÇÃO PARA VALIDAR URL ==========
    function isValidUrl(string) {
        if (!string || string.trim() === '') return true;
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }
    
    // ========== FUNÇÃO PARA SALVAR NO LOCALSTORAGE (FORMATO CONSISTENTE) ==========
    function salvarEventoNoLocalStorage(evento, editCtx=null) {
        // Recuperar eventos existentes no formato do calendário
        let todosEventos = localStorage.getItem('todosEventos');
        let eventosObj = todosEventos ? JSON.parse(todosEventos) : {};
        
        // Criar chave no formato que o calendário espera: "ano_mes_dia"
        const chave = `${evento.ano}_${evento.mes}_${evento.dia}`;
        
        // Adicionar ID único ao evento
        if(!evento.id) evento.id = Date.now();
        
        // Se já existem eventos para esta data, adicionar à lista
        if (!eventosObj[chave]) {
            eventosObj[chave] = [];
        }
        
        if(editCtx){const antiga=`${editCtx.ano}_${editCtx.mes}_${editCtx.dia}`;eventosObj[antiga]=(eventosObj[antiga]||[]).filter(e=>String(e.id)!==String(editCtx.id));}
        eventosObj[chave].push(evento);
        
        // Salvar de volta no localStorage
        localStorage.setItem('todosEventos', JSON.stringify(eventosObj));
        
        // Também salvar separadamente para compatibilidade
        let eventosLista = localStorage.getItem('eventos');
        let listaEventos = eventosLista ? JSON.parse(eventosLista) : [];
        listaEventos.push(evento);
        localStorage.setItem('eventos', JSON.stringify(listaEventos));
        
        console.log('✅ Evento salvo! Chave:', chave);
        console.log('Total de eventos nesta data:', eventosObj[chave].length);
        
        return evento.id;
    }
    
    // ========== PREENCHER DATA DO LOCALSTORAGE ==========
    function preencherData() {
        // Tenta 'dataSelecionada' primeiro, depois 'eventosSelecionados' como fallback
        const dadosData = localStorage.getItem('dataSelecionada') 
                       || localStorage.getItem('eventosSelecionados');
        if (dadosData && dataEventoInput) {
            try {
                const { ano, mes, dia } = JSON.parse(dadosData);
                const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                dataEventoInput.value = dataFormatada;
                console.log('Data preenchida:', dataFormatada);
            } catch(e) {
                console.error("Erro ao ler data do localStorage", e);
            }
        }
    }
    
    preencherData();
    const editData=JSON.parse(localStorage.getItem('eventoEditando')||'null');
    if(editData){ if(tituloInput) tituloInput.value=editData.titulo||''; if(tipoEventoSelect) tipoEventoSelect.value=editData.tipo||'cultural'; if(horarioInput) horarioInput.value=editData.horario||''; if(descricaoTextarea) descricaoTextarea.value=editData.descricao||''; if(linkIngressosInput) linkIngressosInput.value=editData.linkIngressos||''; if(dataInicioInput) dataInicioInput.value=editData.dataInicio||''; if(dataFimInput) dataFimInput.value=editData.dataFim||''; }
    
    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulário submetido');
            
            let valid = true;
            
            // Validar título
            const titulo = tituloInput ? tituloInput.value.trim() : '';
            if (titulo === '') {
                if (erroTitulo) erroTitulo.style.display = 'block';
                if (tituloInput) tituloInput.style.borderColor = '#e26d5c';
                valid = false;
            } else {
                if (erroTitulo) erroTitulo.style.display = 'none';
                if (tituloInput) tituloInput.style.borderColor = '#e2e8f0';
            }
            
            // Validar link de ingressos
            const linkIngressos = linkIngressosInput ? linkIngressosInput.value.trim() : '';
            if (linkIngressos !== '' && !isValidUrl(linkIngressos)) {
                if (erroLink) erroLink.style.display = 'block';
                if (linkIngressosInput) linkIngressosInput.style.borderColor = '#e26d5c';
                valid = false;
            } else {
                if (erroLink) erroLink.style.display = 'none';
                if (linkIngressosInput) linkIngressosInput.style.borderColor = '#e2e8f0';
            }
            
            if(dataInicioInput && !dataInicioInput.value){valid=false;}
            if(dataFimInput && !dataFimInput.value){valid=false;}
            if(dataInicioInput && dataFimInput && dataFimInput.value < dataInicioInput.value){if(erroDataFim) erroDataFim.style.display='block'; valid=false;} else if(erroDataFim){erroDataFim.style.display='none';}
            if (!valid) {
                console.log('Validação falhou');
                return;
            }
            
            // Obter a data do evento
            let ano, mes, dia;
            let dataEvento = dataEventoInput ? dataEventoInput.value : '';
            
            if (dataEvento) {
                const partes = dataEvento.split('-');
                ano = parseInt(partes[0]);
                mes = parseInt(partes[1]) - 1; // Mês 0-index para o calendário
                dia = parseInt(partes[2]);
            } else {
                const hoje = new Date();
                ano = hoje.getFullYear();
                mes = hoje.getMonth();
                dia = hoje.getDate();
            }
            
            console.log('Data do evento:', `${dia}/${mes+1}/${ano}`);
            
            // Obter tipo do evento
            const tipoSelecionado = tipoEventoSelect ? tipoEventoSelect.value : 'cultural';
            
            // Obter horário
            const horario = horarioInput ? horarioInput.value : '';
            
            // Criar descrição
            let descricao = descricaoTextarea ? descricaoTextarea.value.trim() : '';
            if (!descricao) descricao = 'Sem descrição adicional.';
            
            // Criar objeto do evento
            const evento = {
                id: null, // Será gerado ao salvar
                ano: ano,
                mes: mes,
                dia: dia,
                titulo: titulo,
                descricao: descricao,
                tipo: tipoSelecionado,
                linkIngressos: linkIngressos || '',
                imagemUrl: imagemAtual || '',
                horario: horario,
                dataCriacao: new Date().toISOString(),
                dataInicio: dataInicioInput ? dataInicioInput.value : '',
                dataFim: dataFimInput ? dataFimInput.value : ''
            };
            
            console.log('Evento a ser salvo:', evento);
            
            // Salvar no localStorage
            const editCtx=JSON.parse(localStorage.getItem('eventoEditando')||'null');
            const novoId = salvarEventoNoLocalStorage(evento, editCtx);
            
            localStorage.removeItem('eventoEditando');
            alert(`✅ Evento "${titulo}" salvo com sucesso!`);
            
            // Salvar a data selecionada para voltar ao dia correto
            localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));
            
            window.location.href = 'index.html';
        });
    }
    
    // ========== VALIDAÇÃO EM TEMPO REAL ==========
    if (linkIngressosInput) {
        linkIngressosInput.addEventListener('input', function() {
            const link = linkIngressosInput.value.trim();
            if (link !== '' && !isValidUrl(link)) {
                if (erroLink) erroLink.style.display = 'block';
                linkIngressosInput.style.borderColor = '#e26d5c';
            } else {
                if (erroLink) erroLink.style.display = 'none';
                linkIngressosInput.style.borderColor = '#e2e8f0';
            }
        });
    }
    
    if (tituloInput) {
        tituloInput.addEventListener('input', function() {
            if (tituloInput.value.trim() !== '') {
                if (erroTitulo) erroTitulo.style.display = 'none';
                tituloInput.style.borderColor = '#e2e8f0';
            }
        });
    }
    
    // ========== BOTÃO VOLTAR ==========
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            if (tituloInput && tituloInput.value.trim() !== '') {
                const confirmar = confirm('Você tem alterações não salvas. Deseja realmente voltar?');
                if (!confirmar) return;
            }
            window.location.href = 'index.html';
        });
    }
    
    console.log('Formulário inicializado com sucesso!');
});