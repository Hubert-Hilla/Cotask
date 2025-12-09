// components/privacy/PrivacyPolicy.tsx
export default function PrivacyPolicy() {
  return (
    <section id="privacy" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A privacy-focused task and note management application
            </p>
          </div>

          {/* Last Updated */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-lg">
              <span className="font-semibold text-gray-900">Last Updated: </span>
              <span className="text-indigo-600">December 2024</span>
            </p>
            <p className="text-gray-600 mt-2">
              Cotask is a student project developed in Norway. We take your privacy seriously and comply with Norwegian privacy laws and GDPR.
            </p>
          </div>

          {/* Core Principles */}
          <div className="mb-12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Core Principles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Your data is yours. We never sell or share it with third parties.",
                "We collect only what's necessary to provide the service.",
                "You have full control over your data at all times.",
                "We're transparent about our data practices.",
                "Your content remains private by default.",
                "We implement appropriate security measures for a student project."
              ].map((principle, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{principle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            {/* 1. Information We Collect */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Information We Collect</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Account Information</h4>
                  <p>When you create an account, we collect your email address, username, and an encrypted version of your password. This is necessary to create and secure your account.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Content</h4>
                  <p>We store the content you create including task lists, notes, todo items, and any information you add to them. This data is essential for providing the core functionality of Cotask.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Usage Data</h4>
                  <p>We may collect basic usage information to understand how users interact with our service, which helps us identify bugs and improve the user experience.</p>
                </div>
              </div>
            </div>

            {/* 2. How We Use Your Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900">How We Use Your Information</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use your information exclusively to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain the Cotask service</li>
                  <li>Enable collaboration features like sharing lists and notes</li>
                  <li>Keep your data synced across your devices</li>
                  <li>Identify and fix technical issues</li>
                  <li>Ensure the security of your account</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-1">Important Limitations</p>
                  <p>As a student project, Cotask does NOT:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Sell or share your data with third parties</li>
                    <li>Use your data for advertising</li>
                    <li>Analyze your content for commercial purposes</li>
                    <li>Offer automated data export functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Data Sharing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Sharing</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">User-Initiated Sharing</h4>
                  <p>When you choose to share a list or note with another Cotask user, they will be able to see the shared content and your username. You control exactly what is shared and can revoke access at any time.</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Third-Party Services</h4>
                  <p className="mb-2">We use Supabase as our backend service provider. Your data is stored on Supabase's servers, which are GDPR-compliant and located within the European Economic Area (EEA).</p>
                  <p>We do not share your data with any other third parties.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p>We may disclose your information if required by Norwegian law or to protect the safety of our users.</p>
                </div>
              </div>
            </div>

            {/* 4. Data Security */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Security</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>As a student project, we implement appropriate security measures given our resources:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: "HTTPS Encryption", desc: "All data is encrypted in transit" },
                    { title: "Secure Authentication", desc: "Passwords are hashed using industry-standard methods" },
                    { title: "Database Security", desc: "Access to the database is restricted" },
                    { title: "Regular Updates", desc: "We keep dependencies updated for security" }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    <strong>Important Notice:</strong> While we implement security measures appropriate for a student project, Cotask is not designed for highly sensitive data. Please do not store confidential or sensitive personal information in this application.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Your Rights (GDPR) */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Rights Under GDPR</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Under the General Data Protection Regulation (GDPR), you have the following rights:</p>
                <div className="space-y-3">
                  {[
                    { right: "Right to Access", desc: "You can view all your data within the application" },
                    { right: "Right to Rectification", desc: "You can correct inaccurate personal data" },
                    { right: "Right to Erasure", desc: "You can delete your account and all associated data" },
                    { right: "Right to Restrict Processing", desc: "You can request we limit how we use your data" },
                    { right: "Right to Object", desc: "You can object to our processing of your data" },
                    { right: "Right to Data Portability", desc: "You can request a copy of your data (manual process for student projects)" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.right}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                  <p className="text-indigo-800">
                    <strong>Note:</strong> As a student project, automated data export is not available. If you wish to exercise your right to data portability, please contact us and we will manually provide your data in a reasonable format.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Data Retention */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Retention</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>We retain your data for as long as your account is active</li>
                  <li>If you delete your account, we will delete your personal information and content</li>
                  <li>Database backups are retained for up to 30 days for disaster recovery purposes</li>
                  <li>After the project completion period (approximately June 2025), all data will be permanently deleted from our systems</li>
                  <li>Shared content may remain accessible to other users until they delete it</li>
                </ul>
                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <p className="text-yellow-800">
                    <strong>Project Timeline:</strong> Cotask is a student project with an expected completion date of June 2025. After this date, the service may be discontinued and all data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Cookies */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  7
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Cookies</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use minimal cookies necessary for the service to function:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Authentication cookies:</strong> To keep you logged in during your session</li>
                  <li><strong>Session cookies:</strong> To maintain your preferences and settings</li>
                  <li><strong>Security cookies:</strong> To protect against unauthorized access</li>
                </ul>
                <p>We do not use tracking cookies, analytics cookies, or advertising cookies.</p>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    You can control cookies through your browser settings. Disabling cookies may prevent Cotask from functioning properly.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Data Location */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  8
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Location and Processing</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Cotask is developed and operated from Norway. Your data is processed and stored within the European Economic Area (EEA) through our service provider Supabase.</p>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">GDPR Compliance</h4>
                  <p>As a Norwegian-based student project, we comply with:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>The General Data Protection Regulation (GDPR)</li>
                    <li>Norwegian data protection laws (Personopplysningsloven)</li>
                    <li>Data minimization principles</li>
                    <li>Purpose limitation principles</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 9. Children's Privacy */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  9
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Children's Privacy</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Cotask is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16.</p>
                <p>If you are under 16, please do not use this service. If we become aware that we have collected personal information from a child under 16, we will take steps to delete that information.</p>
              </div>
            </div>

            {/* 10. Changes to Policy */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  10
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Changes to This Policy</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We may update this Privacy Policy as the project evolves. Significant changes will be communicated by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Updating the "Last Updated" date at the top of this page</li>
                  <li>Posting a notice within the Cotask application</li>
                </ul>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <p>
                    <strong>Continued Use:</strong> Your continued use of Cotask after changes constitutes your acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-6">
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or wish to exercise your GDPR rights, please contact the project team:
                </p>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-indigo-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Email</p>
                        <a href="mailto:cotask.student@example.com" className="text-indigo-600 hover:text-indigo-800">
                          cotask.student@example.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-indigo-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Response Time</p>
                        <p className="text-gray-700">We aim to respond to all inquiries within 7 days, though response times may vary during exam periods.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-indigo-800">
                    <strong>Student Project Notice:</strong> Cotask is developed by students as part of an academic project. While we strive to handle your data responsibly, please be aware of the limitations of a student project.
                  </p>
                </div>
                
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600 italic">
                    Thank you for trying our student project. We appreciate your understanding of the limitations and hope you find Cotask useful for managing your tasks and notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}