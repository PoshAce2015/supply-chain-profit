# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Scope

This application is a **browser-only, local-first** application with the following security characteristics:

- **No network calls**: All processing happens locally in the browser
- **No PII collection**: No personal data is collected or transmitted
- **No backend**: No server-side code or data storage
- **LocalStorage only**: All data persists locally in the browser

## Reporting a Vulnerability

**Please do NOT file public issues for security vulnerabilities.**

To report a security vulnerability:

1. **Email**: security@your-org.com
2. **Subject**: `[SECURITY] Supply Chain & Profit - [Brief Description]`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity and complexity

## Security Best Practices

- Keep your browser updated
- Use HTTPS when downloading the application
- Regularly clear browser data if needed
- Report suspicious behavior immediately

## No Network Calls Policy

This application is designed to be completely offline-capable. Any attempt to introduce network calls will be rejected during code review.
