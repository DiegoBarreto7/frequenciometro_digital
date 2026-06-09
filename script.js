// --------------------------------------------------------------
// CONFIGURAÇÃO INICIAL: todas as turmas com 35 alunos.
// Estrutura: nome, totalAlunos = 35, faltasAcumuladas no mês
// total de aulas no mês = 40 (padrão)
// frequencia% = ((totalAulas * 35 - faltasAcumuladas) / (totalAulas*35)) * 100
// --------------------------------------------------------------
const TOTAL_ALUNOS_POR_TURMA = 35;
const TOTAL_AULAS_MES = 40;  // 40 aulas no mês (base)

// Lista de turmas
let turmas = [
    { nome: "1º Ano A", faltasAcumuladas: 310 },   // frequencia inicial ~77.86%
    { nome: "1º Ano B", faltasAcumuladas: 260 },   // ~81.43%
    { nome: "1º Ano C", faltasAcumuladas: 275 },   // ~80.36%
    { nome: "2º Ano A", faltasAcumuladas: 190 },   // ~86.43%
    { nome: "2º Ano B", faltasAcumuladas: 370 },   // ~73.57%
    { nome: "3º Ano A", faltasAcumuladas: 230 },   // ~83.57%
    { nome: "3º Ano B", faltasAcumuladas: 110 }    // ~92.14% (top)
];

// Função auxiliar para calcular percentual de frequência com base nas faltas acumuladas
function calcularPercentual(faltas) {
    let totalPresencasMax = TOTAL_ALUNOS_POR_TURMA * TOTAL_AULAS_MES;
    let presencas = totalPresencasMax - faltas;
    if (presencas < 0) presencas = 0;
    return (presencas / totalPresencasMax) * 100;
}

// Obter dados completos para cada turma
function getTurmasData() {
    return turmas.map(t => ({
        nome: t.nome,
        totalAlunos: TOTAL_ALUNOS_POR_TURMA,
        faltas: t.faltasAcumuladas,
        presencas: (TOTAL_ALUNOS_POR_TURMA * TOTAL_AULAS_MES) - t.faltasAcumuladas,
        percentual: calcularPercentual(t.faltasAcumuladas),
        aulasMes: TOTAL_AULAS_MES
    }));
}

// Status e incentivo
function getStatusClass(percentual) {
    if (percentual >= 85) return "alta";
    if (percentual >= 70) return "media";
    return "baixa";
}

function getStatusTexto(percentual) {
    if (percentual >= 85) return "Excelente 🎉";
    if (percentual >= 70) return "Regular 📈";
    return "Atenção! ⚠️";
}

function getIncentivoTexto(percentual) {
    return percentual >= 85 ? "✅ Gincana Garantida" : "⏳ Alcançar 85%";
}

// Atualizar TABELA
function atualizarTabela() {
    const dados = getTurmasData();
    const tbody = document.querySelector("#tabelaFrequencia tbody");
    tbody.innerHTML = "";
    dados.forEach(turma => {
        const percentual = turma.percentual;
        const statusClass = getStatusClass(percentual);
        const statusText = getStatusTexto(percentual);
        const incentivo = getIncentivoTexto(percentual);
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${turma.nome}</strong></td>
            <td>${turma.totalAlunos}</td>
            <td>${turma.faltas}</td>
            <td>${turma.presencas}</td>
            <td>${percentual.toFixed(1)}%</td>
            <td><span class="badge-freq ${statusClass}">${statusText}</span></td>
            <td><i class="fas ${percentual>=85 ? 'fa-trophy' : 'fa-hourglass-half'}"></i> ${incentivo}</td>
        `;
    });
}

// Atualizar RANKING DESTAQUE (POPUP MAIOR com pódio)
function atualizarRankingDestaque() {
    const dados = getTurmasData();
    const ordenadas = [...dados].sort((a,b) => b.percentual - a.percentual);
    const top3 = ordenadas.slice(0,3);
    const podiumDiv = document.getElementById("podiumDinamico");
    podiumDiv.innerHTML = "";
    const medalhas = ["🥇", "🥈", "🥉"];
    const coresMedalha = ["#FFD700", "#C0C0C0", "#CD7F32"];
    top3.forEach((turma, idx) => {
        const card = document.createElement("div");
        card.className = "podium-card";
        card.style.borderTop = `5px solid ${coresMedalha[idx]}`;
        card.innerHTML = `
            <div class="podium-medal">${medalhas[idx]}</div>
            <div class="podium-turma">${turma.nome}</div>
            <div class="podium-freq">${turma.percentual.toFixed(1)}%</div>
            <div class="podium-stats">📊 ${turma.presencas} presenças / ${TOTAL_ALUNOS_POR_TURMA * TOTAL_AULAS_MES} possíveis</div>
            <div style="font-size:0.8rem; margin-top:6px;">🎯 meta superada? ${turma.percentual >= 85 ? "SIM ✓" : "quase lá!"}</div>
        `;
        podiumDiv.appendChild(card);
    });
    // Adicionar menção honrosa caso tenha mais turmas com destaque
    if (ordenadas.length > 3 && ordenadas[3].percentual >= 80) {
        let extraMsg = document.createElement("div");
        extraMsg.style.marginTop = "15px";
        extraMsg.style.textAlign = "center";
        extraMsg.style.fontSize = "0.9rem";
        extraMsg.style.background = "#f9eec1";
        extraMsg.style.padding = "8px";
        extraMsg.style.borderRadius = "40px";
        extraMsg.innerHTML = `<i class="fas fa-star"></i> Menção honrosa: ${ordenadas[3].nome} com ${ordenadas[3].percentual.toFixed(1)}% - continue assim!`;
        podiumDiv.appendChild(extraMsg);
    }
}

// Gráficos
let barChart, doughnutChart;

function atualizarGraficos() {
    const dados = getTurmasData();
    const labels = dados.map(t => t.nome);
    const frequencias = dados.map(t => t.percentual);
    const ctxBar = document.getElementById('freqChartBar').getContext('2d');
    if (barChart) barChart.destroy();
    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequência (%)',
                data: frequencias,
                backgroundColor: '#2e86c1',
                borderRadius: 12,
                hoverBackgroundColor: '#ffb347'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { 
                y: { 
                    title: { display: true, text: 'Percentual (%)' }, 
                    min: 0, 
                    max: 100 
                } 
            }
        }
    });
    
    const mediaGeral = dados.reduce((acc, t) => acc + t.percentual, 0) / dados.length;
    const meta = 85;
    let dadosDoughnut;
    let labelsDoughnut;
    if (mediaGeral >= meta) {
        dadosDoughnut = [mediaGeral, mediaGeral - meta];
        labelsDoughnut = [`Média geral: ${mediaGeral.toFixed(1)}%`, `Excedente +${(mediaGeral-meta).toFixed(1)}%`];
    } else {
        dadosDoughnut = [mediaGeral, meta - mediaGeral];
        labelsDoughnut = [`Média Atual: ${mediaGeral.toFixed(1)}%`, `Faltam ${(meta-mediaGeral).toFixed(1)}% p/ meta`];
    }
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: { 
            labels: labelsDoughnut, 
            datasets: [{ 
                data: dadosDoughnut, 
                backgroundColor: ['#2e86c1', '#ffb347'], 
                cutout: '65%' 
            }] 
        },
        options: { 
            responsive: true, 
            plugins: { legend: { position: 'bottom' } } 
        }
    });
}

// Função principal de refresh total
function refreshAll() {
    atualizarTabela();
    atualizarRankingDestaque();
    atualizarGraficos();
}

// REGISTRAR FALTAS: Adiciona faltas à turma selecionada
function registrarFaltas(turmaNome, numeroFaltas) {
    if (isNaN(numeroFaltas) || numeroFaltas < 0) numeroFaltas = 0;
    if (numeroFaltas > TOTAL_ALUNOS_POR_TURMA) {
        alert(`Atenção: não podem haver mais faltas do que alunos matriculados (${TOTAL_ALUNOS_POR_TURMA}). Será limitado ao máximo.`);
        numeroFaltas = TOTAL_ALUNOS_POR_TURMA;
    }
    const turmaIndex = turmas.findIndex(t => t.nome === turmaNome);
    if (turmaIndex !== -1) {
        let novasFaltas = turmas[turmaIndex].faltasAcumuladas + numeroFaltas;
        let maxPossivelFaltas = TOTAL_ALUNOS_POR_TURMA * TOTAL_AULAS_MES;
        if (novasFaltas > maxPossivelFaltas) {
            alert(`Limite máximo de faltas atingido para ${turmaNome} (todas as aulas). O valor será ajustado.`);
            novasFaltas = maxPossivelFaltas;
        }
        turmas[turmaIndex].faltasAcumuladas = novasFaltas;
        refreshAll();
        const percentualNovo = calcularPercentual(turmas[turmaIndex].faltasAcumuladas);
        alert(`✅ Registrado! ${turmaNome} agora possui ${turmas[turmaIndex].faltasAcumuladas} faltas totais no mês.\n📊 Frequência atual: ${percentualNovo.toFixed(1)}%`);
    } else {
        alert("Turma não encontrada.");
    }
}

// Verificar coerência inicial dos dados
function verificarCoerenciaInicial() {
    turmas = turmas.map(t => {
        let maxFaltas = TOTAL_ALUNOS_POR_TURMA * TOTAL_AULAS_MES;
        let faltas = t.faltasAcumuladas;
        if (faltas > maxFaltas) faltas = maxFaltas;
        if (faltas < 0) faltas = 0;
        return { ...t, faltasAcumuladas: faltas };
    });
}

// Eventos e inicialização
document.addEventListener('DOMContentLoaded', () => {
    verificarCoerenciaInicial();
    refreshAll();
    
    // Configurar botão de registrar faltas
    document.getElementById("btnRegistrarFalta").addEventListener("click", () => {
        const select = document.getElementById("selectTurmaFalta");
        const turmaSelecionada = select.value;
        let faltasInput = parseInt(document.getElementById("faltasHoje").value, 10);
        if (isNaN(faltasInput)) faltasInput = 0;
        if (faltasInput < 0) faltasInput = 0;
        registrarFaltas(turmaSelecionada, faltasInput);
        document.getElementById("faltasHoje").value = 0;
    });
    
    // Adicionar evento de clique no ranking para mostrar mensagem motivacional
    const rankingDiv = document.getElementById("rankingDestaque");
    if(rankingDiv){
        rankingDiv.addEventListener("click", () => {
            const dados = getTurmasData();
            const melhor = [...dados].sort((a,b)=>b.percentual - a.percentual)[0];
            alert(`🏅 Ranking de Assiduidade 🏅\nDestaque atual: ${melhor.nome} com ${melhor.percentual.toFixed(1)}% de frequência.\nContinue registrando faltas e incentive sua turma!`);
        });
    }
    
    console.log("Frequenciômetro Digital - Alunos 3ºB | Prof. Diego Barreto | Base: 35 alunos/turma");
});