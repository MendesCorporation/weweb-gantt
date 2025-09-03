<template>
  <div 
    class="gantt-container" 
    :style="containerStyles" 
    role="application" 
    aria-label="Gráfico de Gantt"
  >
    <!-- Controles de Visualização -->
    <div class="gantt-controls" :style="{ backgroundColor: content.corHeader, borderColor: content.corBorda }">
      <div class="view-controls">
        <button 
          v-for="modo in modoVisualizacao" 
          :key="modo.value"
          :class="['view-btn', { active: content.visualizacao === modo.value }]"
          :style="getButtonStyles(modo.value)"
          @click="alterarVisualizacao(modo.value)"
        >
          {{ modo.label }}
        </button>
      </div>
      <div class="navigation-controls">
        <button class="nav-btn" :style="navButtonStyles" @click="navegarMes(-1)">‹</button>
        <span class="current-period" :style="{ color: content.corTexto }">{{ periodoAtual }}</span>
        <button class="nav-btn" :style="navButtonStyles" @click="navegarMes(1)">›</button>
      </div>
    </div>

    <div class="gantt-header" :style="{ backgroundColor: content.corHeader, borderColor: content.corBorda }">
      <div class="users-column" :style="{ color: content.corTexto, borderColor: content.corBorda }">Usuários</div>
      <div class="timeline-header" :style="{ backgroundColor: content.corFundo }" aria-label="Linha do tempo">
        <div class="time-markers" :style="{ width: `${timelineWidth}px` }">
          <div 
            v-for="marker in timeMarkers" 
            :key="marker.date"
            class="time-marker"
            :class="{ 'today': marker.isToday, 'weekend': marker.isWeekend }"
            :style="{ 
              left: marker.position, 
              color: marker.isToday ? '#3B82F6' : content.corTexto,
              borderLeft: marker.showLine ? `1px solid ${content.corBorda}` : 'none'
            }"
            :aria-label="`Data: ${marker.label}`"
          >
            {{ marker.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="gantt-body" ref="ganttBody">
      <div v-if="processedUsers.length === 0" class="empty-state" :style="{ color: content.corTexto }">
        <p>Nenhum usuário encontrado</p>
        <small>Verifique se os dados de usuários, atividades e projetos estão configurados corretamente.</small>
      </div>
      <div v-else class="gantt-rows">
        <div 
          class="gantt-user-section" 
          v-for="usuario in processedUsers" 
          :key="usuario.id"
          :style="{ 
            minHeight: `${Math.max(50, usuario.linhas.length * 30 + 10)}px`,
            borderColor: content.corBorda
          }"
        >
          <div class="user-info" :style="{ backgroundColor: content.corHeader, borderColor: content.corBorda }">
            <div class="user-label" :style="{ color: content.corTexto }">{{ usuario.nome }}</div>
            <div class="activity-count" :style="{ color: content.corTexto }">{{ usuario.atividades.length }} atividade(s)</div>
          </div>
          <div 
            class="user-timeline" 
            :style="{ 
              minHeight: `${Math.max(50, usuario.linhas.length * 30 + 10)}px`,
              width: `${timelineWidth}px`,
              backgroundColor: content.corFundo
            }"
          >
            <!-- Linhas verticais dos dias -->
            <div class="day-lines">
              <div 
                v-for="linha in dayLines" 
                :key="linha.date"
                class="day-line"
                :class="{ 'today-line': linha.isToday, 'weekend-line': linha.isWeekend }"
                :style="{ 
                  left: linha.position,
                  borderColor: linha.isToday ? '#3B82F6' : content.corBorda,
                  opacity: linha.isWeekend ? 0.3 : 0.1
                }"
              ></div>
            </div>
            
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
                  backgroundColor: obterCorStatus(atividade.status),
                  color: content.corTexto
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
  data() {
    return {
      currentDate: new Date(),
      timelineOffset: 0,
      timelineWidth: 2000,
      modoVisualizacao: [
        { value: 'dia', label: 'Dia' },
        { value: 'semana', label: 'Semana' },
        { value: 'mes', label: 'Mês' }
      ]
    };
  },
  computed: {
    containerStyles() {
      return {
        height: this.content.altura,
        backgroundColor: this.content.corFundo || '#FFFFFF',
        borderColor: this.content.corBorda || '#E5E7EB',
        color: this.content.corTexto || '#374151'
      };
    },

    navButtonStyles() {
      return {
        color: this.content.corTexto || '#374151',
        borderColor: this.content.corBorda || '#E5E7EB'
      };
    },

    periodoAtual() {
      return this.currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    },

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
      // Timeline sempre do dia 1 ao último dia do mês atual
      const ano = this.currentDate.getFullYear();
      const mes = this.currentDate.getMonth();
      
      const inicio = new Date(ano, mes, 1); // Primeiro dia do mês
      const fim = new Date(ano, mes + 1, 0); // Último dia do mês

      return { inicio, fim };
    },

    scrollPosition() {
      // Calcular posição de scroll para focar no dia atual com 7 dias para trás
      const hoje = new Date();
      const range = this.timelineRange;
      
      // Se hoje não está no mês atual, não fazer scroll
      if (hoje.getMonth() !== this.currentDate.getMonth() || hoje.getFullYear() !== this.currentDate.getFullYear()) {
        return 0;
      }

      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24)) + 1;
      const diaAtual = hoje.getDate();
      const diasParaTras = Math.max(0, diaAtual - 7); // 7 dias para trás
      
      return (diasParaTras / totalDias) * this.timelineWidth;
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
      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24)) + 1;
      const modo = this.content.visualizacao || 'semana';
      const markers = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Determinar intervalo baseado no modo
      let intervalo = 1;
      if (modo === 'dia') {
        intervalo = 1; // cada dia
      } else if (modo === 'semana') {
        intervalo = 7; // cada semana (começando na segunda)
      } else {
        intervalo = 1; // cada dia para o mês
      }

      const dataAtual = new Date(range.inicio);
      dataAtual.setHours(0, 0, 0, 0);

      while (dataAtual <= range.fim) {
        const diasDoInicio = dataAtual.getDate() - 1; // Dia do mês - 1 (para começar em 0)
        const position = `${(diasDoInicio / (totalDias - 1)) * this.timelineWidth}px`;

        let label;
        if (modo === 'dia') {
          label = dataAtual.getDate().toString();
        } else if (modo === 'semana') {
          // Mostrar apenas segundas-feiras
          if (dataAtual.getDay() === 1) {
            label = `${dataAtual.getDate()}`;
          } else {
            dataAtual.setDate(dataAtual.getDate() + 1);
            continue;
          }
        } else {
          label = dataAtual.getDate().toString();
        }

        const isToday = dataAtual.getTime() === hoje.getTime();
        const isWeekend = dataAtual.getDay() === 0 || dataAtual.getDay() === 6;

        markers.push({
          date: dataAtual.toISOString(),
          position,
          label,
          isToday,
          isWeekend,
          showLine: true
        });

        dataAtual.setDate(dataAtual.getDate() + intervalo);
      }

      return markers;
    },

    dayLines() {
      const range = this.timelineRange;
      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24)) + 1;
      const lines = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataAtual = new Date(range.inicio);
      dataAtual.setHours(0, 0, 0, 0);

      while (dataAtual <= range.fim) {
        const diasDoInicio = dataAtual.getDate() - 1; // Dia do mês - 1
        const position = `${(diasDoInicio / (totalDias - 1)) * this.timelineWidth}px`;

        const isToday = dataAtual.getTime() === hoje.getTime();
        const isWeekend = dataAtual.getDay() === 0 || dataAtual.getDay() === 6;

        lines.push({
          date: dataAtual.toISOString(),
          position,
          isToday,
          isWeekend
        });

        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      return lines;
    },
  },

  methods: {
    calcularPosicaoAtividade(atividade) {
      const range = this.timelineRange;
      const totalDias = Math.ceil((range.fim - range.inicio) / (1000 * 60 * 60 * 24)) + 1;

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

      // Verificar se a atividade está no mês atual
      if (dataInicio.getMonth() !== this.currentDate.getMonth() || 
          dataInicio.getFullYear() !== this.currentDate.getFullYear()) {
        // Se não está no mês, não exibir
        return {
          left: '-100px',
          width: '0px',
          semDatas: true
        };
      }

      // Calcular posição baseada no dia do mês
      const diaInicio = dataInicio.getDate() - 1; // Dia do mês - 1
      const left = (diaInicio / (totalDias - 1)) * this.timelineWidth;

      // Calcular largura
      let width = 20; // Largura mínima
      if (dataFim && !isNaN(dataFim.getTime()) && dataFim > dataInicio) {
        const diaFim = dataFim.getDate() - 1;
        const duracaoDias = diaFim - diaInicio + 1;
        width = Math.max(20, (duracaoDias / (totalDias - 1)) * this.timelineWidth);
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
      // Usar trigger-event conforme documentação WeWeb
      this.$emit('trigger-event', {
        name: 'onActivityClick',
        payload: {
          atividade,
          usuario,
          projeto: atividade.nomeProjeto
        }
      });
    },

    alterarVisualizacao(modo) {
      this.$emit('update:content', { visualizacao: modo });
    },

    getButtonStyles(modo) {
      const isActive = this.content.visualizacao === modo;
      return {
        backgroundColor: isActive ? (this.content.corTexto || '#374151') : 'transparent',
        color: isActive ? (this.content.corFundo || '#FFFFFF') : (this.content.corTexto || '#374151'),
        borderColor: this.content.corBorda || '#E5E7EB'
      };
    },

    navegarMes(direcao) {
      const novaData = new Date(this.currentDate);
      novaData.setMonth(novaData.getMonth() + direcao);
      this.currentDate = novaData;
      
      // Scroll para a posição correta após mudança de mês
      this.$nextTick(() => {
        this.scrollToCurrentDay();
      });
    },

    scrollToCurrentDay() {
      if (this.$refs.ganttBody) {
        this.$refs.ganttBody.scrollLeft = this.scrollPosition;
      }
    },

    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
  border: 1px solid;
  border-radius: 8px;
  overflow: hidden;
}

.gantt-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn {
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.view-btn:hover {
  opacity: 0.8;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-btn:hover {
  opacity: 0.8;
}

.today-btn {
  font-size: 12px;
  padding: 4px 12px;
}

.current-period {
  font-size: 14px;
  font-weight: 500;
  min-width: 200px;
  text-align: center;
}

.gantt-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 2px solid;
}

.users-column {
  padding: 12px 16px;
  font-weight: 600;
  border-right: 1px solid;
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
}

.time-marker {
  position: absolute;
  font-size: 12px;
  white-space: nowrap;
  transform: translateX(-50%);
  padding-left: 8px;
}

.time-marker.today {
  font-weight: 700;
}

.time-marker.weekend {
  opacity: 0.6;
}

.gantt-body {
  overflow-y: auto;
  max-height: calc(100% - 48px);
}

.gantt-user-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid;
  min-height: 50px;
}

.user-info {
  padding: 8px 16px;
  border-right: 1px solid;
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
  opacity: 0.7;
}

.user-timeline {
  position: relative;
  overflow-x: auto;
  min-height: 50px;
}

.day-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.day-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px solid;
}

.day-line.today-line {
  border-left-width: 2px;
  z-index: 2;
}

.day-line.weekend-line {
  background-color: rgba(0, 0, 0, 0.05);
  width: 2px;
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
  .gantt-controls {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .navigation-controls {
    justify-content: center;
  }
  
  .current-period {
    min-width: auto;
  }
  
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
}

@media (max-width: 480px) {
  .view-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .view-btn {
    width: 100%;
  }
  
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
  background: rgba(0, 0, 0, 0.05);
}

.gantt-body::-webkit-scrollbar-thumb,
.timeline-header::-webkit-scrollbar-thumb,
.user-timeline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.gantt-body::-webkit-scrollbar-thumb:hover,
.timeline-header::-webkit-scrollbar-thumb:hover,
.user-timeline::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
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
  