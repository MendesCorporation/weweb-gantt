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
  },
};
