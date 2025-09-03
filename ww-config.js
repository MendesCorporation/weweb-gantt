export default {
  editor: {
    label: {
      en: "Gantt Chart",
      pt: "Gráfico Gantt",
    },
  },
  properties: {
    atividades: {
      label: {
        en: "Activities",
        pt: "Atividades",
      },
      type: "Array",
      bindable: true,
      defaultValue: [],
    },
    usuarios: {
      label: {
        en: "Users",
        pt: "Usuários",
      },
      type: "Array",
      bindable: true,
      defaultValue: [],
    },
    projetos: {
      label: {
        en: "Projects",
        pt: "Projetos",
      },
      type: "Array",
      bindable: true,
      defaultValue: [],
    },
    altura: {
      label: {
        en: "Height",
        pt: "Altura",
      },
      type: "Length",
      defaultValue: "400px",
    },
    corPendente: {
      label: {
        en: "Pending Color",
        pt: "Cor Pendente",
      },
      type: "Color",
      defaultValue: "#9CA3AF",
    },
    corEmDesenvolvimento: {
      label: {
        en: "In Development Color",
        pt: "Cor Em Desenvolvimento",
      },
      type: "Color",
      defaultValue: "#3B82F6",
    },
    corEmValidacao: {
      label: {
        en: "In Validation Color",
        pt: "Cor Em Validação",
      },
      type: "Color",
      defaultValue: "#F59E0B",
    },
    corFinalizada: {
      label: {
        en: "Completed Color",
        pt: "Cor Finalizada",
      },
      type: "Color",
      defaultValue: "#10B981",
    },
    corFundo: {
      label: {
        en: "Background Color",
        pt: "Cor de Fundo",
      },
      type: "Color",
      defaultValue: "#FFFFFF",
    },
    corBorda: {
      label: {
        en: "Border Color",
        pt: "Cor da Borda",
      },
      type: "Color",
      defaultValue: "#E5E7EB",
    },
    corTexto: {
      label: {
        en: "Text Color",
        pt: "Cor do Texto",
      },
      type: "Color",
      defaultValue: "#374151",
    },
    corHeader: {
      label: {
        en: "Header Color",
        pt: "Cor do Cabeçalho",
      },
      type: "Color",
      defaultValue: "#F9FAFB",
    },
    corDiaAtual: {
      label: {
        en: "Current Day Color",
        pt: "Cor do Dia Atual",
      },
      type: "Color",
      defaultValue: "#3B82F6",
    },
    visualizacao: {
      label: {
        en: "View Mode",
        pt: "Modo de Visualização",
      },
      type: "TextSelect",
      options: {
        choices: [
          { value: "dia", label: { en: "Day", pt: "Dia" } },
          { value: "semana", label: { en: "Week", pt: "Semana" } },
          { value: "mes", label: { en: "Month", pt: "Mês" } }
        ]
      },
      defaultValue: "semana",
    },
  },
  triggerEvents: [
    {
      name: "onActivityClick",
      label: {
        en: "Activity Clicked",
        pt: "Atividade Clicada"
      }
    }
  ],
};
