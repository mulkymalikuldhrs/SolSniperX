# Security Policy

## 🔒 Security

We take the security of SolSniperX seriously. If you discover a security vulnerability, please follow the responsible disclosure process outlined below.

**⚠️ For Education Purpose Only** — This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 📣 Reporting a Vulnerability

If you discover a security vulnerability within SolSniperX, please report it by:

1. **Email:** Send a detailed report to **mulkymalikuldhaher@email.com**
2. **Do NOT** create a public GitHub issue for security vulnerabilities
3. Include the following in your report:
   - Type of vulnerability
   - Full path of the affected file(s)
   - Steps to reproduce
   - Potential impact
   - Any possible mitigation

We will acknowledge your report within 48 hours and provide a detailed response within 7 days.

## 🔐 Security Best Practices

- Private keys are loaded into memory only at startup and never persisted to disk
- The frontend never directly handles private keys; all operations are proxied through the backend
- API keys are managed through environment variables, never hardcoded
- All wallet operations go through the secure backend API
- Never commit your `.env` file or private keys to version control

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading cryptocurrencies, especially memecoins, involves significant risk and can result in substantial financial losses. The authors are not responsible for any financial decisions made using this tool. Always do your own research and never invest more than you can afford to lose.

**Contact:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com
