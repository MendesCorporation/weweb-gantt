<template>
  <div class="gantt-container" :style="{ height: content.altura }" role="application" aria-label="Gráfico de Gantt">
    <div class="gantt-header">
      <div class="users-column">Usuários</div>
      <div class="timeline-header" aria-label="Linha do tempo">
        <div class="time-markers">
          <div 
            v-for="marker in timeMarkers" 
            :key="marker.date"
            class="time-marker"
            :style="{ left: marker.position }"
            :aria-label="`Data: ${marker.label}`"
          >
            {{ marker.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="gantt-body">
      <div v-if="processedUsers.length === 0" class="empty-state">
        <p>Nenhum usuário encontrado</p>
        <small>Verifique se os dados de usuários, atividades e projetos estão configurados corretamente.</small>
      </div>
      <div v-else class="gantt-rows">
        <div 
          class="gantt-user-section" 
          v-for="usuario in processedUsers" 
          :key="usuario.id"
          :style="{ minHeight: `${Math.max(50, usuario.linhas.length * 30 + 10)}px` }"
        >
          <div class="user-info">
            <div class="user-label">{{ usuario.nome }}</div>
            <div class="activity-count">{{ usuario.atividades.length }} atividade(s)</div>
          </div>
          <div class="user-timeline" :style="{ minHeight: `${Math.max(50, usuario.linhas.length * 30 + 10)}px` }">
            <div 
              v-for="(linha, linhaIndex) in usuario.linhas" 
              :key="`linha-${linhaIndex}`"
              class="timeline-row"
              :style="{ top: `${linhaIndex * 30 + 5}px` }"
            >
              <div 
                v-for="atividade in linha" 
                :key="atividade.id"
                class="activity-bar"
                :class="{ 'sem-datas': calcularPosicaoAtividade(atividade).semDatas }"
                :style="{
                  left: calcularPosicaoAtividade(atividade).left,
                  width: calcularPosicaoAtividade(atividade).width,
                  backgroundColor: obterCorStatus(atividade.status)
                }"
                :title="criarTooltip(atividade)"
                :aria-label="`Projeto: ${atividade.nomeProjeto}, Atividade: ${atividade.nome || 'Sem nome'}, Status: ${atividade.status || 'Sem status'}, Responsável: ${usuario.nome}`"
                role="button"
                tabindex="0"
                @click="onActivityClick(atividade, usuario)"
                @keydown.enter="onActivityClick(atividade, usuario)"
                @keydown.space="onActivityClick(atividade, usuario)"
              >
                <span class="project-name">{{ atividade.nomeProjeto }}</span>
                <span class="activity-name">{{ atividade.nome || 'Sem nome' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, required: true },
  },
  computed: {
    processedUsers() {
      const usuarios = Array.isArray(this.content.usuarios) ? this.content.usuarios : [];
      const atividades = Array.isArray(this.content.atividades) ? this.content.atividades : [];
      const projetos = Array.isArray(this.content.projetos) ? this.content.projetos : [];

      // Criar mapa de projetos por ID
      const projetosMap = {};
      projetos.forEach(projeto => {
        if (projeto && projeto.id) {
          projetosMap[projeto.id] = projeto;
        }
      });

      // Criar mapa de usuários por ID - MOSTRAR TODOS OS USUÁRIOS
      const usuariosMap = {};
      usuarios.forEach(usuario => {
        if (usuario && usuario.id && usuario.ativo !== false) {
          usuariosMap[usuario.id] = {
            id: usuario.id,
            nome: usuario.nome || 'Usuário sem nome',
            atividades: [],
            linhas: [] // Para organizar atividades em múltiplas linhas
          };
        }
      });

      // Agrupar atividades por usuário e adicionar informações do projeto
      const atividadesSemUsuario = [];
      atividades.forEach(atividade => {
        if (!atividade) {
          console.warn('Gantt: Atividade inválida encontrada', atividade);
          return;
        }

        // Adicionar informações do projeto
        const projeto = projetosMap[atividade.projeto];
        const atividadeComProjeto = {
          ...atividade,
          nomeProjeto: projeto ? projeto.nome : 'Projeto não encontrado'
        };

        // Validar datas se existirem
        if (atividade.data_inicio && atividade.data_previsao_termino) {
          const inicio = new Date(atividade.data_inicio);
          const fim = new Date(atividade.data_previsao_termino);
          
          if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            console.warn('Gantt: Datas inválidas na atividade', atividade.id, atividade);
          } else if (inicio > fim) {
            console.warn('Gantt: Data de início posterior à data de fim na atividade', atividade.id);
          }
        }

        if (atividade.assigned_to && usuariosMap[atividade.assigned_to]) {
          usuariosMap[atividade.assigned_to].atividades.push(atividadeComProjeto);
        } else {
          atividadesSemUsuario.push(atividadeComProjeto);
        }
      });

      // Organizar atividades em linhas para evitar sobreposição
      Object.values(usuariosMap).forEach(usuario => {
        usuario.linhas = this.organizarAtividadesEmLinhas(usuario.atividades);
      });

      // Converter para array - INCLUIR TODOS OS USUÁRIOS
      const result = Object.values(usuariosMap);

      // Adicionar grupo "Não Atribuído" se houver atividades sem usuário
      if (atividadesSemUsuario.length > 0) {
        const usuarioNaoAtribuido = {
          id: 'nao-atribuido',
          nome: 'Não Atribuído',
          atividades: atividadesSemUsuario,
          linhas: this.organizarAtividadesEmLinhas(atividadesSemUsuario)
        };
        result.push(usuarioNaoAtribuido);
      }

      return result;
    },

    timelineRange() {
      if (!this.content.atividades || !Array.isArray(this.content.atividades)) {
        // Período padrão de 30 dias a partir de hoje
        const hoje = new Date();
        const fim = new Date(hoje);
        fim.setDate(hoje.getDate() + 30);
        return { inicio: hoje, fim };
      }

      let dataMinima = null;
      let dataMaxima = null;

      this.content.atividades.forEach(atividade => {
        if (!atividade) return;

        const dataInicio = atividade.data_inicio ? new Date(atividade.data_inicio) : null;
        const dataFim = atividade.data_previsao_termino ? new Date(atividade.data_previsao_termino) : null;

        // Verificar data de início
        if (dataInicio && !isNaN(dataInicio.getTime())) {
          if (!dataMinima || dataInicio < dataMinima) {
            dataMinima = dataInicio;
          }
          if (!dataMaxima || dataInicio > dataMaxima) {
            dataMaxima = dataInicio;
          }
        }

        // Verificar data de fim
        if (dataFim && !isNaN(dataFim.getTime())) {
          if (!dataMinima || dataFim < dataMinima) {
            dataMinima = dataFim;
          }
          if (!dataMaxima || dataFim > dataMaxima) {
            dataMaxima = dataFim;
          }
        }
      });

      // Se não encontrou datas válidas, usar período padrão
      if (!dataMinima || !dataMaxima) {
        const hoje = new Date();
        const fim = new Date(hoje);
        fim.setDate(hoje.getDate() + 30);
        return { inicio: hoje, fim };
      }

      // Adicionar margem de segurança (7 dias antes e depois)
      const inicio = new Date(dataMinima);
      inicio.setDate(inicio.getDate() - 7);
      
      const fim = new Date(dataMaxima);
      fim.setDate(fim.getDate() + 7);

      return { inicio, fim };
    },

    statusColors() {
      return {
        'Pendente': this.content.corPendente || '#9CA3AF',
        'Em desenvolvimento': this.content.corEmDesenvolvimento || '#3B82F6',
        'Em validação': this.content.corEmValidacao || '#F59E0B',
        'Finalizada': this.content.corFinalizada || '#10B981'
      };
    },

    timeMarkers() {
      const range = this.timelineRange;
      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24));
      const larguraTotal = 800;
      const markers = [];

      // Determinar intervalo baseado na duração total
      let intervalo = 1; // dias
      if (totalDias > 60) {
        intervalo = 7; // semanas
      } else if (totalDias > 14) {
        intervalo = 3; // a cada 3 dias
      }

      const dataAtual = new Date(range.inicio);
      let contador = 0;

      while (dataAtual <= range.fim && contador < 20) { // Limite de 20 marcadores
        const diasDoInicio = Math.ceil((dataAtual - range.inicio) / (1000 * 60 * 60 * 24));
        const position = `${(diasDoInicio / totalDias) * larguraTotal}px`;

        let label;
        if (intervalo === 7) {
          label = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } else {
          label = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }

        markers.push({
          date: dataAtual.toISOString(),
          position,
          label
        });

        dataAtual.setDate(dataAtual.getDate() + intervalo);
        contador++;
      }

      return markers;
    },
  },

  methods: {
    calcularPosicaoAtividade(atividade) {
      const range = this.timelineRange;
      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24));
      const larguraTotal = 800; // Largura fixa da timeline em pixels

      const dataInicio = atividade.data_inicio ? new Date(atividade.data_inicio) : null;
      const dataFim = atividade.data_previsao_termino ? new Date(atividade.data_previsao_termino) : null;

      // Se não tem datas, exibir como ponto no início
      if (!dataInicio || isNaN(dataInicio.getTime())) {
        return {
          left: '0px',
          width: '8px',
          semDatas: true
        };
      }

      // Calcular posição de início
      const diasDoInicio = Math.ceil((dataInicio - range.inicio) / (1000 * 60 * 60 * 24));
      const left = Math.max(0, (diasDoInicio / totalDias) * larguraTotal);

      // Calcular largura
      let width = 8; // Largura mínima para atividades sem data fim
      if (dataFim && !isNaN(dataFim.getTime()) && dataFim > dataInicio) {
        const duracaoDias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
        width = Math.max(8, (duracaoDias / totalDias) * larguraTotal);
      }

      return {
        left: `${left}px`,
        width: `${width}px`,
        semDatas: false
      };
    },

    obterCorStatus(status) {
      return this.statusColors[status] || '#6B7280'; // Cor padrão para status não reconhecidos
    },

    organizarAtividadesEmLinhas(atividades) {
      if (!atividades || atividades.length === 0) return [];

      const linhas = [];
      
      // Ordenar atividades por data de início
      const atividadesOrdenadas = [...atividades].sort((a, b) => {
        const dataA = a.data_inicio ? new Date(a.data_inicio) : new Date(0);
        const dataB = b.data_inicio ? new Date(b.data_inicio) : new Date(0);
        return dataA - dataB;
      });

      atividadesOrdenadas.forEach(atividade => {
        let linhaEncontrada = false;
        
        // Tentar colocar na primeira linha disponível
        for (let i = 0; i < linhas.length; i++) {
          if (this.podeAdicionarNaLinha(atividade, linhas[i])) {
            linhas[i].push(atividade);
            linhaEncontrada = true;
            break;
          }
        }
        
        // Se não encontrou linha disponível, criar nova linha
        if (!linhaEncontrada) {
          linhas.push([atividade]);
        }
      });

      return linhas;
    },

    podeAdicionarNaLinha(novaAtividade, linha) {
      const novaInicio = novaAtividade.data_inicio ? new Date(novaAtividade.data_inicio) : null;
      const novaFim = novaAtividade.data_previsao_termino ? new Date(novaAtividade.data_previsao_termino) : null;

      if (!novaInicio) return true; // Atividades sem data podem ser adicionadas

      return !linha.some(atividade => {
        const inicio = atividade.data_inicio ? new Date(atividade.data_inicio) : null;
        const fim = atividade.data_previsao_termino ? new Date(atividade.data_previsao_termino) : null;

        if (!inicio) return false;

        // Verificar sobreposição
        const fimComparacao = fim || inicio;
        const novaFimComparacao = novaFim || novaInicio;

        return !(novaFimComparacao < inicio || novaInicio > fimComparacao);
      });
    },

    onActivityClick(atividade, usuario) {
      this.$emit('onActivityClick', {
        atividade,
        usuario,
        projeto: atividade.nomeProjeto
      });
    },

    criarTooltip(atividade) {
      const dataInicio = atividade.data_inicio ? 
        new Date(atividade.data_inicio).toLocaleDateString('pt-BR') : 'Não definida';
      const dataFim = atividade.data_previsao_termino ? 
        new Date(atividade.data_previsao_termino).toLocaleDateString('pt-BR') : 'Não definida';
      
      return `${atividade.nomeProjeto} - ${atividade.nome || 'Atividade sem nome'}
Status: ${atividade.status || 'Sem status'}
Início: ${dataInicio}
Previsão: ${dataFim}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.gantt-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.gantt-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
}

.users-column {
  padding: 12px 16px;
  font-weight: 600;
  border-right: 1px solid #e5e7eb;
  background: #f3f4f6;
}

.timeline-header {
  padding: 12px 16px;
  font-weight: 600;
  position: relative;
  overflow-x: auto;
}

.time-markers {
  position: relative;
  height: 20px;
  width: 800px;
}

.time-marker {
  position: absolute;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  transform: translateX(-50%);
}

.gantt-body {
  overflow-y: auto;
  max-height: calc(100% - 48px);
}

.gantt-user-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid #e5e7eb;
  min-height: 50px;
}

.user-info {
  padding: 8px 16px;
  border-right: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.activity-count {
  font-size: 12px;
  color: #6b7280;
}

.user-timeline {
  position: relative;
  overflow-x: auto;
  width: 800px;
  min-height: 50px;
}

.timeline-row {
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  padding: 2px 8px;
}

.activity-bar {
  position: absolute;
  height: 24px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.activity-bar:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.activity-bar:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.activity-bar.sem-datas {
  border-radius: 50%;
  padding: 0;
  justify-content: center;
  align-items: center;
}

.project-name {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  line-height: 1;
}

.activity-name {
  font-size: 11px;
  color: white;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1;
  margin-top: 1px;
}

.activity-bar.sem-datas .project-name,
.activity-bar.sem-datas .activity-name {
  display: none;
}

/* Responsividade */
@media (max-width: 768px) {
  .gantt-header {
    grid-template-columns: 150px 1fr;
  }
  
  .gantt-user-section {
    grid-template-columns: 150px 1fr;
  }
  
  .users-column,
  .user-label {
    font-size: 12px;
  }
  
  .user-info {
    padding: 6px 12px;
  }
  
  .user-timeline {
    width: 600px;
  }
  
  .time-markers {
    width: 600px;
  }
}

@media (max-width: 480px) {
  .gantt-header {
    grid-template-columns: 120px 1fr;
  }
  
  .gantt-user-section {
    grid-template-columns: 120px 1fr;
  }
  
  .users-column,
  .user-label {
    font-size: 11px;
  }
  
  .user-info {
    padding: 4px 8px;
  }
  
  .user-timeline {
    width: 400px;
  }
  
  .time-markers {
    width: 400px;
  }
  
  .activity-bar {
    height: 20px;
    padding: 1px 4px;
  }
  
  .project-name {
    font-size: 9px;
  }
  
  .activity-name {
    font-size: 9px;
  }
}

/* Scroll customizado */
.gantt-body::-webkit-scrollbar,
.timeline-header::-webkit-scrollbar,
.user-timeline::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.gantt-body::-webkit-scrollbar-track,
.timeline-header::-webkit-scrollbar-track,
.user-timeline::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.gantt-body::-webkit-scrollbar-thumb,
.timeline-header::-webkit-scrollbar-thumb,
.user-timeline::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.gantt-body::-webkit-scrollbar-thumb:hover,
.timeline-header::-webkit-scrollbar-thumb:hover,
.user-timeline::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Estado vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.empty-state small {
  font-size: 14px;
  color: #9ca3af;
}
</style>
  