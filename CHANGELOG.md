# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-12-19

### Added
- Full E2E test suite covering complete application workflow
- Comprehensive backup/restore functionality for settings and mappings
- Reset safety requiring "RESET" confirmation
- Self-test system for app integrity verification
- Performance optimizations with memoized calculations
- Accessibility improvements for alerts drawer
- Version chip in header showing current app version

### Changed
- Enhanced calculator performance with useMemo optimizations
- Improved alerts drawer with keyboard navigation and focus management
- Settings UI with backup/restore and enhanced reset safety

### Fixed
- TypeScript strict mode compliance
- Redux-persist configuration issues
- Self-test banner integration

## [1.0.0] - 2024-12-19

### Added
- Complete Supply Chain & Profit application
- CSV import system with mapping and validation
- Calculator with profitability analysis and margin calculations
- SLA engine with alerts and monitoring
- Orders checklist with two-person rule enforcement
- Analytics dashboard with segment performance metrics
- Cashflow simulation with runway calculations
- Settlement reconciliation with variance tracking
- Data validator with rule-based checks
- Settings management with configurable rates
- User management for multi-user workflows
- Real-time KPI dashboard in header
- Template downloads and mapping export/import
- Local-first architecture with no network dependencies
- Comprehensive unit test suite
- E2E smoke tests for core functionality

### Technical Features
- React 18 with TypeScript
- Redux Toolkit with persistence
- Tailwind CSS for styling
- Vite for build tooling
- Vitest for unit testing
- Playwright for E2E testing
- ESLint and Prettier for code quality
