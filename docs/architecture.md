# Supply Chain & Profit - Architecture

## Overview
Supply Chain & Profit is a local-first SPA for processing CSV data and calculating profit margins for e-commerce operations. The application processes data locally without any network calls, focusing on reliability and data integrity.

## Tech Stack
- **Runtime**: Node.js 20 LTS
- **Build**: Vite 5 + TypeScript 5 (strict mode)
- **UI**: React 18 + Tailwind CSS + Headless UI
- **State**: Redux Toolkit + redux-persist
- **Data**: Papa Parse + Zod validation
- **Testing**: Vitest + Testing Library + Playwright

## Application Structure

### Core Principles
1. **Local-first**: No network calls, all data processed locally
2. **Pure functions**: All calculations are pure and testable
3. **Type safety**: Strict TypeScript with Zod validation
4. **Performance**: Optimized for large datasets (10k+ rows)
5. **Reliability**: Comprehensive error handling and validation

### Directory Structure
```
/src
  /app          # Store, providers, routing, feature flags
  /components   # Reusable UI components
  /features     # Feature-based modules
    /imports    # CSV import and mapping
    /calculator # Margin calculations
    /orders     # Order management
    /sla        # SLA monitoring
    /analytics  # Performance metrics
    /cashflow   # Cash flow simulation
    /reconcile  # Settlement reconciliation
    /validator  # Data validation
    /settings   # App configuration
    /users      # User management
  /lib          # Pure utility functions
    /calc       # Calculation functions
    /selectors  # Redux selectors
    /csv        # CSV schemas and parsers
    /time       # Date/time utilities
    /storage    # Persistence logic
    /colors     # UI color utilities
    /constants  # App constants
    /testdata   # Test fixtures
  /styles       # Global styles
  /docs         # Documentation
```

## Data Flow

### Import Process
1. User selects CSV file
2. File parsed with Papa Parse
3. Headers auto-detected and mapped
4. Data validated with Zod schemas
5. Invalid rows quarantined with reasons
6. Valid data indexed and stored in Redux

### Calculation Process
1. Raw data loaded from store
2. Pure functions calculate margins
3. Results cached in derived state
4. UI updates reactively
5. All calculations use 4-decimal precision

### Persistence
- Redux-persist saves to LocalStorage
- Namespace: `scp:v1:*`
- Versioned migrations for schema changes
- One-click data reset capability

## Performance Considerations

### Optimization Strategies
- Lazy loading of large datasets
- Memoized selectors for expensive calculations
- Virtual scrolling for large tables
- Debounced user inputs
- Background processing for heavy operations

### Performance Budgets
- CSV parsing: < 2s for 10k rows
- SLA calculations: < 150ms for 5k orders
- First paint: < 1.5s on cold load
- Memory usage: < 100MB for 50k rows

## Security & Privacy

### Data Handling
- No network calls or external APIs
- No PII collection or storage
- LocalStorage only for persistence
- One-click complete data wipe
- CSV files processed in memory only

### File Validation
- Explicit file type checking
- Size limits on uploads
- Malformed data quarantine
- Error reporting for failed imports

## Error Handling

### Validation Strategy
- Zod schemas for all data structures
- Graceful degradation for missing data
- User-friendly error messages
- Detailed error logging for debugging
- Recovery mechanisms for corrupted state

### Error Boundaries
- Global error boundary for unhandled errors
- Feature-specific error boundaries
- Graceful fallbacks for failed components
- Error reporting to user with actionable steps

## Testing Strategy

### Test Pyramid
- Unit tests: 90%+ coverage on critical logic
- Integration tests: Feature workflows
- E2E tests: Critical user journeys
- Performance tests: Load and stress testing

### Test Data
- Deterministic fixtures for calculations
- Known good/bad samples for validation (using Attachment Doc folder)
- Performance test datasets
- Edge case scenarios

## Future Considerations

### Scalability
- Web Workers for heavy calculations
- IndexedDB for larger datasets
- Service Worker for offline capability
- Progressive Web App features

### Extensibility
- Plugin architecture for custom calculations
- Export formats beyond CSV
- Integration points for external systems
- Custom validation rules
