import { motion } from 'framer-motion'
import { ArrowLeft, Shield, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to SolSniperX</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 20, 2024
            </p>
          </div>

          {/* Terms Content */}
          <div className="card-modern p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using SolSniperX ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                SolSniperX is an AI-powered automated trading bot designed for Solana blockchain tokens. The service provides:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Real-time token detection and analysis</li>
                <li>Automated trading capabilities</li>
                <li>Risk assessment and anti-rug protection</li>
                <li>Portfolio management and analytics</li>
                <li>Price alerts and notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Risk Disclosure</h2>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-red-400">High Risk Warning</h4>
                    <p className="text-xs text-muted-foreground">
                      Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Trading cryptocurrencies, especially memecoins, carries significant financial risk. You may lose some or all of your invested capital. Past performance does not guarantee future results. You should never invest more than you can afford to lose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a user of SolSniperX, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your private keys and account credentials</li>
                <li>Use the service in compliance with applicable laws and regulations</li>
                <li>Not attempt to manipulate or exploit the service</li>
                <li>Not use the service for illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take your privacy seriously. Your private keys are encrypted using AES-256 encryption and stored securely. We do not have access to your unencrypted private keys. For more information, please review our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                SolSniperX and its creators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. This includes but is not limited to trading losses, system downtime, or data loss.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to maintain high availability, we do not guarantee that the service will be available 100% of the time. The service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of SolSniperX are owned by Mulky Malikul Dhaher and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your access to the service at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users or the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-accent rounded-lg">
                <p className="font-semibold">Mulky Malikul Dhaher</p>
                <p className="text-muted-foreground">Email: mulkymalikuldhr@mail.com</p>
                <p className="text-muted-foreground">Project: SolSniperX</p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By using SolSniperX, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

