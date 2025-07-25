import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 20, 2024
            </p>
          </div>

          {/* Privacy Content */}
          <div className="card-modern p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At SolSniperX, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered trading bot service. Please read this privacy policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-blue-400" />
                    Personal Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may collect the following personal information:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Username and email address (if provided)</li>
                    <li>Wallet addresses (public keys only)</li>
                    <li>Trading preferences and settings</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-green-400" />
                    Sensitive Information
                  </h3>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-green-400">Zero-Knowledge Architecture</h4>
                        <p className="text-xs text-muted-foreground">
                          Your private keys are encrypted with AES-256 and stored locally. We never have access to your unencrypted private keys.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Private keys are encrypted using industry-standard AES-256 encryption before storage. The encryption key is derived from your session and is never transmitted to our servers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and maintain our trading bot service</li>
                <li>Execute trades on your behalf based on your settings</li>
                <li>Send notifications and alerts as configured</li>
                <li>Improve our service and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold">Encryption</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All sensitive data is encrypted using AES-256 encryption, both in transit and at rest.
                  </p>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h3 className="font-semibold">Access Control</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Strict access controls ensure only authorized personnel can access system components.
                  </p>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Database className="w-6 h-6 text-purple-400" />
                    <h3 className="font-semibold">Data Minimization</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We collect and store only the minimum data necessary to provide our services.
                  </p>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Eye className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-semibold">Monitoring</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring for security threats and unauthorized access attempts.
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>In connection with a business transfer or merger</li>
                <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. Trading data may be retained for analytical purposes and regulatory compliance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Right to access your personal information</li>
                <li>Right to rectify inaccurate information</li>
                <li>Right to erase your personal information</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our service. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service may integrate with third-party blockchain networks and APIs. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-accent rounded-lg">
                <p className="font-semibold">Mulky Malikul Dhaher</p>
                <p className="text-muted-foreground">Email: mulkymalikuldhr@mail.com</p>
                <p className="text-muted-foreground">Project: SolSniperX</p>
                <p className="text-muted-foreground">Subject: Privacy Policy Inquiry</p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By using SolSniperX, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

