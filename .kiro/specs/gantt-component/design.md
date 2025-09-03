# Documento de Design - Componente Gantt

## Visão Geral

O componente Gantt será implementado como um elemento customizado WeWeb que renderiza um gráfico de Gantt interativo. O componente receberá dados de usuários e atividades através de propriedades bindáveis e renderizará uma visualização em timeline com barras coloridas representando o status e duração das atividades.

## Arquitetura

### Estrutura do Componente

O componente seguirá a arquitetura padrão WeWeb com:
- `src/wwElement.vue`: Componente Vue principal
- `ww-config.js`: Configuração de propriedades e metadados

### Fluxo de Dados

```
Dados Bindados (usuarios + atividades) → Processamento → Renderização Gantt
```

1. **Entrada**: Dados das tabelas `usuarios` e `atividades` via binding
2. **Processamento**: Agrupamento por usuário, cálculo de posições e cores
3. **Saída**: Renderização visual do Gantt com barras e labels

## Componentes e Interfaces

### Propriedades do Componente (ww-config.js)

```javascript
{
  atividades: {
    type: "Array",
    bindable: true,
    defaultValue: []
  },
  usuarios: {
    type: "Array", 
    bindable: true,
    defaultValue: []
  },
  altura: {
    type: "Length",
    defaultValue: "400px"
  },
  corPendente: {
    type: "Color",
    defaultValue: "#9CA3AF"
  },
  corEmDesenvolvimento: {
    type: "Color", 
    defaultValue: "#3B82F6"
  },
  corEmValidacao: {
    type: "Color",
    defaultValue: "#F59E0B"
  },
  corFinalizada: {
    type: "Color",
    defaultValue: "#10B981"
  }
}
```

### Estrutura do Template Vue

```vue
<template>
  <div class="gantt-container">
    <div class="gantt-header">
      <div class="users-column">Usuários</div>
      <div class="timeline-header">
        <!-- Escala de tempo -->
      </div>
    </div>
    <div class="gantt-body">
      <div class="gantt-row" v-for="usuario in processedUsers">
        <div class="user-label">{{ usuario.nome }}</div>
        <div class="timeline-row">
          <div class="activity-bar" v-for="atividade in usuario.atividades">
            <!-- Barra da atividade -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Computed Properties Principais

1. **processedUsers**: Agrupa atividades por usuário responsável
2. **timelineRange**: Calcula período total (min/max datas)
3. **timeScale**: Define escala de tempo (dias/semanas)
4. **activityPositions**: Calcula posições das barras no timeline

## Modelos de Dados

### Estrutura Esperada - Usuários
```javascript
{
  id: "uuid",
  nome: "string",
  email: "string", 
  role: "string",
  ativo: boolean
}
```

### Estrutura Esperada - Atividades
```javascript
{
  id: "number",
  nome: "string",
  descricao: "string",
  assigned_to: "uuid", // FK para usuarios
  data_inicio: "timestamp",
  data_previsao_termino: "timestamp", 
  data_real_termino: "timestamp",
  status: "Pendente|Em desenvolvimento|Em validação|Finalizada"
}
```

### Modelo Processado Interno
```javascript
{
  usuario: {
    id: "uuid",
    nome: "string",
    atividades: [
      {
        id: "number",
        nome: "string", 
        startDate: Date,
        endDate: Date,
        status: "string",
        position: { left: "px", width: "px" },
        color: "hex"
      }
    ]
  }
}
```

## Tratamento de Erros

### Dados Inválidos
- **Atividades sem datas**: Exibir como ponto no início do timeline
- **Usuário não encontrado**: Agrupar em "Não Atribuído"
- **Datas inválidas**: Ignorar atividade com log de aviso

### Estados de Loading
- **Dados vazios**: Exibir mensagem "Nenhuma atividade encontrada"
- **Carregamento**: Mostrar skeleton/placeholder

### Validações
- Verificar se `data_inicio <= data_previsao_termino`
- Validar formato de datas antes do processamento
- Verificar se status está nos valores permitidos

## Estratégia de Testes

### Testes Unitários
1. **Processamento de dados**: Verificar agrupamento correto por usuário
2. **Cálculo de posições**: Validar posicionamento das barras
3. **Mapeamento de cores**: Confirmar cores por status
4. **Tratamento de edge cases**: Dados inválidos, vazios, etc.

### Testes de Integração
1. **Binding de dados**: Verificar recepção correta dos dados
2. **Renderização**: Confirmar estrutura DOM gerada
3. **Responsividade**: Testar em diferentes tamanhos de tela

### Casos de Teste Principais
- Atividades com todas as datas preenchidas
- Atividades sem datas (pendentes)
- Múltiplos usuários com múltiplas atividades
- Usuário sem atividades atribuídas
- Atividades sem usuário atribuído
- Timeline com diferentes períodos (dias, semanas, meses)

## Considerações de Performance

### Otimizações
- **Virtual scrolling**: Para muitos usuários/atividades
- **Memoização**: Cache de cálculos de posição
- **Lazy rendering**: Renderizar apenas itens visíveis

### Limitações
- Máximo recomendado: 100 usuários, 1000 atividades
- Timeline máximo: 2 anos para manter performance

## Acessibilidade

- Labels ARIA para barras de atividades
- Navegação por teclado
- Contraste adequado nas cores
- Texto alternativo para elementos visuais