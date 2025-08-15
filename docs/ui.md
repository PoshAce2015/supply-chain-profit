# Supply Chain & Profit - UI & UX Guidelines

## Design System

### Color Palette
- **Primary**: Indigo/violet/sky gradient (#6366f1 to #0ea5e9)
- **Success**: Green (#10b981) - margins ≥10%
- **Warning**: Yellow (#f59e0b) - margins 5-<10%
- **Error**: Red (#ef4444) - margins <0%
- **Info**: Purple (#8b5cf6) - thin margins 0-5%
- **Neutral**: Gray (#6b7280) - insufficient data

### Typography
- **Font**: Inter (system fallback)
- **Headings**: Font weight 600-700
- **Body**: Font weight 400
- **Monospace**: For IDs, amounts, calculations

### Spacing
- **Base unit**: 4px
- **Small**: 8px, 12px
- **Medium**: 16px, 24px
- **Large**: 32px, 48px
- **Extra large**: 64px, 96px

## Layout Structure

### Header
- Indigo/violet/sky gradient background
- App title and version
- KPI tiles: Revenue, Profit, Orders, Avg Margin, Settlement Variance
- User menu and settings access

### Navigation
- Tab-based navigation
- Active tab highlighted
- Badge indicators for alerts
- Responsive collapse to hamburger menu

### Main Content
- Tab content areas
- Consistent padding and margins
- Loading states and skeletons
- Empty states with helpful messaging

### Right Drawer
- Alerts list with filters
- Recent imports
- SLA quick-edit panel
- Collapsible and keyboard accessible

## Component Guidelines

### Tables
- TanStack Table for data grids
- Sortable columns
- Pagination for large datasets
- Row selection and bulk actions
- Export functionality

### Forms
- React Hook Form for validation
- Consistent field styling
- Error states and validation messages
- Auto-save where appropriate

### Buttons
- Primary: Blue gradient
- Secondary: Gray outline
- Danger: Red for destructive actions
- Success: Green for confirmations
- Consistent sizing and spacing

### Badges & Pills
- Margin status indicators
- Color-coded by value ranges
- Compact and readable
- Consistent across all views

### Modals & Dialogs
- Headless UI for accessibility
- Focus trap and keyboard navigation
- Backdrop click to close
- Consistent sizing and positioning

## User Experience

### Loading States
- Skeleton screens for content
- Progress indicators for operations
- Disabled states during processing
- Clear feedback for long operations

### Error Handling
- User-friendly error messages
- Recovery suggestions
- Error boundaries for graceful degradation
- Logging for debugging

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast requirements

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized layouts for different screen sizes

## Feature-Specific UI

### Imports Tab
- Drag-and-drop file upload
- Header mapping interface
- Progress indicators
- Error summary with downloadable reports
- Success confirmation

### Calculator Tab
- Per-row margin display
- Color-coded badges
- Drill-down popovers for calculations
- Channel toggle (FBA/FBM)
- Fee mode selection

### Orders Tab
- Two-step verification workflow
- Aging pipeline view
- Role-based permissions
- Audit trail display
- Bulk actions

### SLA Tab
- Alert banners and counts
- Timeline visualization
- Filter and search
- Acknowledge actions
- Two-person rule enforcement

### Analytics Tab
- Chart.js visualizations
- Filter controls
- Export functionality
- Trend analysis
- Performance metrics

### Cashflow Tab
- Input forms for parameters
- Daily schedule table
- Chart visualization
- Low-balance warnings
- Export capabilities

### Reconcile Tab
- Variance analysis
- Threshold indicators
- Contributor breakdown
- Settlement variance KPI
- Mismatch highlighting

### Validator Tab
- Data quality indicators
- Validation rules display
- Error categorization
- Fix suggestions
- Quality score

### Settings Tab
- Rate configuration
- SLA settings
- User preferences
- Data management
- System information

### Users Tab
- User list and roles
- Permission management
- Audit log display
- Two-person rule toggle
- User activity tracking

## Performance Considerations

### Optimization
- Lazy loading of components
- Virtual scrolling for large lists
- Debounced user inputs
- Memoized expensive calculations
- Efficient re-renders

### Progressive Enhancement
- Core functionality without JavaScript
- Enhanced experience with JS enabled
- Graceful degradation
- Offline capability considerations

## Testing Guidelines

### Visual Testing
- Screenshot testing for critical flows
- Cross-browser compatibility
- Responsive design validation
- Accessibility testing

### Interaction Testing
- User event testing with Testing Library
- Keyboard navigation testing
- Screen reader testing
- Touch interaction testing

### Performance Testing
- Load time measurements
- Memory usage monitoring
- Large dataset handling
- Animation performance

## Implementation Notes

### Component Library
- Headless UI for complex interactions
- Heroicons for consistent iconography
- Tailwind CSS for styling
- Custom components for business logic

### State Management
- Redux Toolkit for global state
- Local state for UI interactions
- Form state with React Hook Form
- Persistent state with redux-persist

### Data Flow
- Unidirectional data flow
- Immutable state updates
- Optimistic UI updates
- Error state handling
