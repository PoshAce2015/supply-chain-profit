# Analytics Features Documentation

## Overview

The Analytics page provides comprehensive supply chain performance analytics and insights. It offers real-time data visualization, filtering capabilities, trend analysis, and export functionality for supply chain professionals.

## Table of Contents

1. [Core Features](#core-features)
2. [Data Visualization](#data-visualization)
3. [Filtering & Controls](#filtering--controls)
4. [Trend Analysis](#trend-analysis)
5. [Export Functionality](#export-functionality)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Accessibility Features](#accessibility-features)
8. [Performance Optimization](#performance-optimization)
9. [User Interface](#user-interface)
10. [Technical Implementation](#technical-implementation)

## Core Features

### Analytics Dashboard

The analytics dashboard displays four key supply chain performance metrics:

- **IN → USPO**: Average processing time from order to purchase order
- **USSHIP → STACKRY**: Average shipping time to Stackry warehouse
- **EXPORT → CUSTOMS**: Average customs clearance time
- **DELIVERED → PAYMENT**: Average payment processing time

Each metric is displayed in a professional card format with:
- Color-coded icons and values
- Hover effects for better interaction
- Real-time data updates
- Filtered data indicators

### Data Processing

- **Real-time Calculations**: Analytics are computed on-demand using memoized calculations
- **Battery Product Handling**: Special handling for battery products with extra processing days
- **Data Validation**: Automatic validation of input data and error handling
- **Performance Optimization**: Efficient data processing with React useMemo hooks

## Data Visualization

### Chart Types

The analytics page supports multiple chart visualization types:

#### Bar Charts
- **Custom SVG Implementation**: Professional bar charts with gradients
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects and value displays
- **Color Coding**: Consistent color scheme across all segments

#### Chart Controls
- **Type Selection**: Switch between bar, line, and radar charts
- **Accessibility Mode**: Enhanced descriptions for screen readers
- **High Contrast Mode**: Better visibility for users with visual impairments

### Chart Features

- **Gradient Effects**: Professional visual styling with linear gradients
- **Value Labels**: Clear display of numerical values
- **Axis Labels**: Properly formatted axis labels and titles
- **Responsive Scaling**: Automatic scaling based on data values

## Filtering & Controls

### Date Range Filters

#### Quick Filters
- **Last 7 Days**: Recent week data
- **Last 30 Days**: Recent month data
- **Last 90 Days**: Recent quarter data
- **Custom Range**: User-defined date range

#### Custom Date Selection
- **Start Date Picker**: Select custom start date
- **End Date Picker**: Select custom end date
- **Real-time Updates**: Analytics update immediately on filter change

### Advanced Filters

#### Segment Selection
- **Individual Segment Toggle**: Show/hide specific segments
- **Color-coded Labels**: Visual identification of segments
- **Checkbox Interface**: Easy selection/deselection

#### Product Type Filtering
- **All Products**: Include all product types
- **Battery Products Only**: Filter for battery-containing products
- **Non-Battery Products Only**: Exclude battery products

### Filter Controls

- **Show/Hide Filters**: Toggle advanced filter panel
- **Real-time Filtering**: Instant updates based on filter changes
- **Filter Status Display**: Shows active filters and data counts

## Trend Analysis

### Time Period Analysis

#### Period Types
- **Weekly Trends**: 7-day period analysis
- **Monthly Trends**: 30-day period analysis
- **Quarterly Trends**: 90-day period analysis

#### Trend Data Display
- **Historical Table**: Comprehensive trend data in table format
- **Period Comparison**: Side-by-side comparison of different time periods
- **Data Sorting**: Automatic sorting by date

### Trend Features

- **12-Period Analysis**: Historical data across 12 periods
- **Segment Comparison**: All segments displayed in trend table
- **Hover Effects**: Interactive table rows with hover states
- **Responsive Design**: Horizontal scrolling on smaller screens

## Export Functionality

### Export Formats

#### CSV Export
- **Standard Format**: Compatible with Excel and other spreadsheet applications
- **Metadata Included**: Export context and filter information
- **Professional Headers**: Clear column headers and descriptions
- **Automatic Naming**: Descriptive filenames with date ranges

#### Export Features
- **Loading States**: Visual feedback during export process
- **Error Handling**: Graceful error management
- **File Download**: Automatic file download with proper MIME types

### Export Data Structure

```csv
Segment,Value (Days),Description
IN → USPO,2.5,Average processing time
USSHIP → STACKRY,3.2,Average shipping time
EXPORT → CUSTOMS,4.1,Average customs clearance
DELIVERED → PAYMENT,1.8,Average payment time
```

## Keyboard Shortcuts

### Available Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl/Cmd + K` | Show Shortcuts | Display keyboard shortcuts help |
| `Ctrl/Cmd + F` | Show Filters | Open advanced filters panel |
| `Ctrl/Cmd + T` | Toggle Trends | Show/hide trend analysis |
| `Ctrl/Cmd + C` | Toggle Charts | Show/hide data visualization |
| `Ctrl/Cmd + R` | Refresh Data | Refresh analytics data |
| `Ctrl/Cmd + Enter` | Export Data | Export current data as CSV |
| `Escape` | Close Modals | Close all open modals and panels |

### Shortcuts Help Panel

- **Interactive Display**: All shortcuts listed in organized format
- **Cross-platform Support**: Works with both Ctrl (Windows/Linux) and Cmd (Mac)
- **Visual Key Display**: Professional keyboard key styling
- **Usage Tips**: Helpful tips for power users

## Accessibility Features

### Accessibility Mode

#### Enhanced Features
- **Screen Reader Support**: ARIA labels and semantic descriptions
- **Chart Descriptions**: Detailed chart descriptions for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Semantic HTML**: Proper HTML structure for assistive technologies

#### Accessibility Controls
- **Toggle Button**: Easy enable/disable of accessibility features
- **Visual Indicators**: Clear indication of accessibility mode status
- **Feature List**: Comprehensive list of available accessibility features

### High Contrast Mode

- **Enhanced Visibility**: Better contrast for users with visual impairments
- **Toggle Control**: Easy enable/disable of high contrast
- **Automatic Detection**: Respects user system preferences

### Reduced Motion Support

- **Motion Sensitivity**: Automatic detection of user motion preferences
- **Respects Settings**: Honors `prefers-reduced-motion` media query
- **Visual Indicator**: Shows when reduced motion is active

### Accessibility Information Panel

When accessibility mode is enabled, users see:
- Keyboard navigation support details
- High contrast mode information
- Screen reader friendly descriptions
- Reduced motion support details
- ARIA labels and semantic HTML structure

## Performance Optimization

### Memoized Calculations

- **React useMemo**: Efficient data processing and filtering
- **Dependency Tracking**: Automatic recalculation when dependencies change
- **Performance Monitoring**: Real-time performance metrics

### Loading States

- **Professional Spinners**: Loading indicators during data processing
- **Progress Feedback**: Visual feedback for long-running operations
- **Error Handling**: Graceful error states with retry options

### Data Caching

- **Filtered Data Caching**: Cached results for filtered data
- **Trend Data Optimization**: Efficient trend calculation
- **Chart Data Memoization**: Optimized chart data generation

## User Interface

### Professional Design

#### Visual Elements
- **Modern Card Design**: Professional card-based layout
- **Consistent Color Scheme**: Unified color palette throughout
- **Hover Effects**: Interactive feedback on all clickable elements
- **Responsive Layout**: Adapts to desktop, tablet, and mobile screens

#### Layout Structure
- **Header Section**: Page title and description
- **Controls Panel**: Centralized control section
- **Analytics Grid**: Main metrics display
- **Information Panel**: Detailed information and accessibility controls

### Interactive Elements

#### Buttons and Controls
- **Professional Styling**: Consistent button design
- **Loading States**: Visual feedback during operations
- **Disabled States**: Clear indication of disabled controls
- **Hover Effects**: Interactive feedback

#### Form Elements
- **Date Pickers**: Professional date selection interface
- **Dropdown Menus**: Clean and accessible dropdown controls
- **Checkboxes**: Clear checkbox interface for segment selection

## Technical Implementation

### React Components

#### Main Component: `AnalyticsView`
- **State Management**: Comprehensive state for all features
- **Effect Hooks**: Side effects for data loading and keyboard shortcuts
- **Memoization**: Performance optimization with useMemo

#### Key Features
- **TypeScript Support**: Full type safety
- **Error Boundaries**: Graceful error handling
- **Performance Monitoring**: Built-in performance tracking

### Data Flow

1. **Data Loading**: Events loaded from Redux store
2. **Filtering**: Real-time filtering based on user selections
3. **Calculation**: Analytics computed using memoized functions
4. **Rendering**: Optimized rendering with React hooks
5. **Updates**: Automatic updates when data changes

### State Management

#### Local State
- **Loading States**: Data loading and processing states
- **Filter States**: Date range and segment filter states
- **UI States**: Modal and panel visibility states
- **Accessibility States**: Accessibility mode toggles

#### Computed State
- **Filtered Data**: Computed filtered events and analytics
- **Chart Data**: Generated chart data for visualization
- **Trend Data**: Computed trend analysis data

### Performance Considerations

- **Memoization**: Extensive use of React useMemo for performance
- **Efficient Rendering**: Optimized component rendering
- **Memory Management**: Proper cleanup of event listeners
- **Error Handling**: Comprehensive error boundaries

## Usage Guide

### Getting Started

1. **Navigate to Analytics**: Access the analytics page from the main navigation
2. **View Default Data**: See current analytics for all segments
3. **Apply Filters**: Use date range and segment filters as needed
4. **Explore Trends**: Enable trend analysis for historical data
5. **Export Data**: Use export functionality to download data

### Best Practices

- **Use Keyboard Shortcuts**: Learn and use keyboard shortcuts for efficiency
- **Enable Accessibility**: Turn on accessibility mode if needed
- **Filter Data**: Use filters to focus on relevant time periods
- **Export Regularly**: Export data for external analysis and reporting

### Troubleshooting

#### Common Issues
- **Data Not Loading**: Check if events data is available
- **Filters Not Working**: Ensure date range is valid
- **Export Failing**: Check browser download settings
- **Performance Issues**: Refresh page to clear cached data

#### Support
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + K` for shortcuts help
- **Accessibility**: Enable accessibility mode for enhanced support
- **Error Messages**: Check error messages for specific issues

## Future Enhancements

### Planned Features
- **Additional Chart Types**: Line and radar chart implementations
- **Advanced Analytics**: Statistical analysis and predictions
- **Custom Dashboards**: User-configurable dashboard layouts
- **Real-time Updates**: WebSocket-based real-time data updates
- **Advanced Export**: Additional export formats (JSON, Excel)

### Technical Improvements
- **Chart Library Integration**: Integration with professional chart libraries
- **Advanced Filtering**: More sophisticated filtering options
- **Performance Monitoring**: Enhanced performance tracking
- **Mobile Optimization**: Improved mobile experience

---

*This documentation covers all implemented analytics features as of the current version. For technical details or implementation questions, refer to the source code in `src/features/analytics/`.*
