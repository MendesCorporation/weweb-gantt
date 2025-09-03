# Componente Gráfico Gantt para WeWeb

Um componente Gantt interativo e abrangente projetado especificamente para aplicações WeWeb. Este componente fornece visualização poderosa de cronogramas de projeto com suporte completo a binding de dados e opções extensivas de customização.

## Funcionalidades

### 📊 Funcionalidade Principal
- **Visualização Interativa de Timeline**: Exibe atividades como barras horizontais em uma timeline
- **Múltiplas Escalas de Tempo**: Suporte para visualização por dias, semanas e meses
- **Acompanhamento de Progresso**: Barras de progresso visuais dentro das barras de atividades
- **Exibição de Atribuição de Usuários**: Mostra usuários atribuídos com avatares e nomes
- **Indicador de Data Atual**: Destaca a data de hoje na timeline

### 🔗 WeWeb Integration
- **Full Data Binding**: Bind tasks and users data from any WeWeb data source
- **Responsive Properties**: All visual properties support WeWeb's responsive system
- **Action Integration**: Configurable click actions that integrate with WeWeb workflows
- **Property Panel**: Comprehensive configuration through WeWeb's property panel

### 🎨 Customization
- **Color Themes**: Customize colors for different task states and UI elements
- **Typography Control**: Adjustable font sizes for tasks and headers
- **Layout Options**: Configurable panel widths and row heights
- **Accessibility**: High contrast mode and keyboard navigation support

### ⚡ Performance
- **Virtual Scrolling**: Efficient rendering for large datasets (100+ tasks)
- **Optimized Updates**: Incremental rendering for data changes
- **Memory Management**: Automatic cleanup and performance monitoring
- **Responsive Design**: Mobile-friendly with adaptive layouts

### 🛡️ Error Handling
- **Data Validation**: Comprehensive validation with helpful error messages
- **Graceful Fallbacks**: Automatic error recovery and fallback states
- **Developer Warnings**: Validation warnings in development mode
- **Loading States**: Smooth loading animations and progress indicators

## Installation

1. Add the component files to your WeWeb project:
   - `src/wwElement.vue` - Main component file
   - `ww-config.js` - WeWeb configuration

2. The component will automatically appear in your WeWeb component library

## Configuration

### Required Data Structure

#### Tasks Data
```javascript
[
  {
    id: 1,                          // Unique identifier
    name: "Task Name",              // Display name (required)
    startDate: "2024-01-01",        // Start date (required)
    endDate: "2024-01-05",          // End date (required)
    assignedUser: 1,                // User ID reference
    progress: 50,                   // Progress percentage (0-100)
    status: "in-progress",          // Task status
    color: "#3B82F6",               // Custom color (optional)
    description: "Task details"     // Additional information
  }
]
```

#### Users Data
```javascript
[
  {
    id: 1,                          // Unique identifier
    name: "John Doe",               // Display name (required)
    avatar: "https://...",          // Avatar image URL
    color: "#3B82F6",               // Associated color
    role: "Developer"               // User role/title
  }
]
```

### Property Configuration

#### Data Properties
- **Tasks Data**: Bindable array of task objects
- **Users Data**: Bindable array of user objects

#### Timeline Settings
- **Start Date**: Timeline start date (auto-calculated if not set)
- **End Date**: Timeline end date (auto-calculated if not set)
- **Time Scale**: Display scale (days, weeks, months)
- **Show Weekends**: Include weekends in timeline

#### Appearance
- **Chart Height**: Overall component height
- **Task Colors**: Colors for different task states
- **Grid Color**: Timeline grid line color
- **Background Color**: Component background
- **Text Color**: Default text color

#### Advanced Styling
- **Task Font Size**: Font size for task labels
- **Header Font Size**: Font size for timeline headers
- **Task Row Height**: Height of each task row
- **Left Panel Width**: Width of the task list panel

#### Interaction
- **Enable Tooltips**: Show detailed tooltips on hover
- **Enable Task Click**: Allow clicking on tasks
- **Task Click Action**: WeWeb action to trigger on task click
- **Keyboard Navigation**: Enable keyboard shortcuts

#### Accessibility
- **High Contrast Mode**: Enhanced contrast for accessibility
- **Reduced Motion**: Respect user's motion preferences

## Usage Examples

### Basic Setup
1. Add the Gantt Chart component to your page
2. Bind your tasks data to the "Tasks Data" property
3. Bind your users data to the "Users Data" property
4. Configure appearance and interaction settings

### With WeWeb Collections
```javascript
// Bind to a WeWeb collection
tasksData: {{ collections.tasks }}
usersData: {{ collections.users }}
```

### Custom Styling
```javascript
// Custom color scheme
taskBarColor: "#2563EB"
completedTaskColor: "#059669"
gridColor: "#E5E7EB"
backgroundColor: "#FFFFFF"
```

### Interactive Features
```javascript
// Enable interactions
enableTooltips: true
enableTaskClick: true
taskClickAction: "navigate-to-task-detail"
```

## Task Status Values

The component supports the following task status values:
- `not-started`: Gray color, indicates task hasn't begun
- `in-progress`: Blue color (default), indicates active task
- `completed`: Green color, indicates finished task
- `on-hold`: Orange color, indicates paused task

## Performance Considerations

### Large Datasets
- Virtual scrolling automatically activates for 50+ tasks
- Consider pagination for datasets over 200 tasks
- Use incremental data loading when possible

### Optimization Tips
- Provide stable task IDs to enable efficient updates
- Use consistent date formats across all tasks
- Minimize unnecessary property changes

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Accessibility Features

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Arrow keys for timeline navigation
- **High Contrast Mode**: Enhanced visibility option
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects user preferences

## Troubleshooting

### Common Issues

**Chart not displaying**
- Verify tasks data is a valid array
- Check that required fields (name, startDate, endDate) are present
- Ensure dates are in a recognizable format

**Performance issues**
- Enable virtual scrolling for large datasets
- Check for circular dependencies in task data
- Verify data updates are incremental

**Styling problems**
- Check responsive property settings
- Verify color values are valid hex codes
- Ensure container has sufficient height

### Error Messages

The component provides detailed error messages for common issues:
- Invalid data structure
- Missing required fields
- Invalid date formats
- Performance warnings

## Development

### Local Development
1. Clone the component files
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Building
```bash
npm run build
```

### Testing
```bash
npm run test
```

## License

This component is designed for use with WeWeb applications. Please refer to your WeWeb license for usage terms.

## Support

For support and questions:
1. Check the WeWeb documentation
2. Review this README for common solutions
3. Contact WeWeb support for platform-specific issues

## Changelog

### Version 1.0.0
- Initial release
- Full Gantt chart functionality
- WeWeb integration
- Virtual scrolling support
- Comprehensive error handling
- Accessibility features