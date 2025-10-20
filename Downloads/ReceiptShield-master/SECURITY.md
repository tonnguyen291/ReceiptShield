# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

The ReceiptShield team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [security@receiptshield.com](mailto:security@receiptshield.com)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on the progress of fixing the vulnerability
- Credit in the security advisory (unless you prefer to remain anonymous)

### Security Measures

ReceiptShield implements several security measures:

1. **Authentication & Authorization**
   - Firebase Authentication with MFA support
   - Role-based access control (RBAC)
   - JWT token-based API security

2. **Data Protection**
   - Encryption at rest (Firebase Firestore)
   - Encryption in transit (HTTPS/TLS)
   - Secure file storage with Firebase Storage rules

3. **Input Validation**
   - Server-side validation for all inputs
   - Zod schema validation
   - XSS protection through React's built-in escaping

4. **API Security**
   - Rate limiting on sensitive endpoints
   - CORS configuration
   - Environment variable protection

5. **Dependency Management**
   - Regular dependency updates
   - Automated security scanning
   - npm audit checks in CI/CD

### Best Practices for Users

1. **Strong Passwords**: Use unique, complex passwords
2. **Environment Variables**: Never commit `.env` files
3. **Access Control**: Follow principle of least privilege
4. **Regular Updates**: Keep dependencies updated
5. **Monitoring**: Enable audit logging and monitoring

### Security Update Process

1. Security issue reported
2. Issue validated and severity assessed
3. Fix developed and tested
4. Security advisory published
5. Patch released
6. Users notified via GitHub Security Advisories

### Disclosure Policy

- We will coordinate disclosure with the reporter
- We aim to patch critical vulnerabilities within 30 days
- We will credit reporters in security advisories (unless anonymous)

### Security Hardening Checklist

For production deployments:

- [ ] Enable Firebase Security Rules
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Configure Content Security Policy (CSP)
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Dependency scanning enabled
- [ ] Environment variables secured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)

Thank you for helping keep ReceiptShield and its users safe!

