// PrivacyPolicyModal.tsx - Comprehensive Privacy Policy
// Matches the style of TermsOfServiceModal

import { useState } from 'react';
import { X, Shield, Lock, Eye, Database, Users, Bell } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIVACY_POLICY_VERSION = '1.0.0';
const LAST_UPDATED = 'December 15, 2024';

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#1a2332]" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Your Privacy Matters
            </h3>
            <p className="text-blue-900">
              At Discovering Me ("Accountable"), we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our accountability platform.
            </p>
            <p className="text-blue-900 mt-3">
              By using Discovering Me, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Navigation</h4>
            <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
              <li>Information We Collect</li>
              <li>How We Use Your Information</li>
              <li>Information Sharing</li>
              <li>Circle & Community Sharing</li>
              <li>Data Security</li>
              <li>Data Retention</li>
              <li>Your Rights & Choices</li>
              <li>Cookies & Tracking</li>
              <li>Third-Party Services</li>
              <li>Children's Privacy</li>
              <li>International Users</li>
              <li>Changes to Privacy Policy</li>
              <li>Contact Us</li>
            </ol>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            
            {/* Section 1 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5" />
                1. Information We Collect
              </h3>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1.1 Information You Provide</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li><strong>Account Information:</strong> Email address, full name, password (encrypted)</li>
                    <li><strong>Profile Information:</strong> Profile picture, location (city, state), bio, personal goals</li>
                    <li><strong>Circle Activity:</strong> Messages, check-ins, support requests, mood updates</li>
                    <li><strong>Accountability Data:</strong> Goals, progress updates, milestone completions</li>
                    <li><strong>Communications:</strong> Messages to other users, feedback, support inquiries</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1.2 Information Automatically Collected</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                    <li><strong>Usage Information:</strong> Pages visited, features used, time spent, interactions</li>
                    <li><strong>Log Data:</strong> Access times, error logs, performance metrics</li>
                    <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1.3 Information from Third Parties</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li><strong>Authentication Services:</strong> If you sign in with Google, Apple, or other providers</li>
                    <li><strong>Analytics Services:</strong> Usage statistics and behavior analytics</li>
                    <li><strong>Content Moderation:</strong> Image analysis for safety compliance</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                2. How We Use Your Information
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>We use your information to:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li><strong>Provide Services:</strong> Create and maintain your account, enable accountability features, facilitate circle connections</li>
                  <li><strong>Improve Platform:</strong> Analyze usage patterns, fix bugs, develop new features</li>
                  <li><strong>Safety & Security:</strong> Moderate content, prevent abuse, protect users, enforce terms</li>
                  <li><strong>Communications:</strong> Send notifications, updates, support responses, important announcements</li>
                  <li><strong>Personalization:</strong> Customize your experience, recommend connections, suggest features</li>
                  <li><strong>Legal Compliance:</strong> Comply with laws, respond to legal requests, protect rights</li>
                  <li><strong>Research & Analytics:</strong> Aggregate data analysis, trends, platform health (anonymized)</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                3. Information Sharing
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">We DO NOT sell your personal information. We share information only in these limited circumstances:</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.1 With Your Circle Members</h4>
                  <p>When you join an accountability circle, you explicitly share certain information with circle members:</p>
                  <ul className="ml-6 list-disc space-y-1 mt-2">
                    <li>Profile information (name, photo, location)</li>
                    <li>Check-ins and mood updates</li>
                    <li>Messages in circle chat</li>
                    <li>Support requests you create</li>
                    <li>Accountability goals and progress</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.2 Service Providers</h4>
                  <p>We share data with trusted third parties who help us operate:</p>
                  <ul className="ml-6 list-disc space-y-1 mt-2">
                    <li><strong>Hosting:</strong> Supabase (database and authentication)</li>
                    <li><strong>Email:</strong> Resend (transactional emails)</li>
                    <li><strong>Content Moderation:</strong> Sightengine (image safety)</li>
                    <li><strong>Analytics:</strong> Usage and performance monitoring</li>
                    <li><strong>Push Notifications:</strong> Web push services</li>
                  </ul>
                  <p className="mt-2 text-sm italic">All service providers are bound by confidentiality agreements.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h4>
                  <p>We may disclose information if required by law or to:</p>
                  <ul className="ml-6 list-disc space-y-1 mt-2">
                    <li>Comply with legal obligations, court orders, subpoenas</li>
                    <li>Protect rights, property, or safety of Discovering Me, users, or public</li>
                    <li>Prevent fraud, abuse, or illegal activity</li>
                    <li>Respond to emergencies involving danger of death or serious injury</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3.4 Business Transfers</h4>
                  <p>If we're acquired or merged, your information may be transferred. You'll be notified of any ownership changes.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-xl font-bold text-yellow-900 mb-3">
                4. Circle & Community Sharing
              </h3>
              <div className="space-y-2 text-yellow-900">
                <p className="font-semibold">⚠️ Important: Circle Information is Shared</p>
                <p>
                  When you participate in accountability circles, your activity is visible to other circle members. This includes:
                </p>
                <ul className="ml-6 list-disc space-y-1 mt-2">
                  <li>Your profile information</li>
                  <li>Messages you send in circle chat</li>
                  <li>Check-ins and mood updates you post</li>
                  <li>Support requests you create</li>
                  <li>Your activity status</li>
                </ul>
                <p className="mt-3 font-semibold">
                  Only share information you're comfortable with your circle members seeing. Circle members can screenshot or save content you share.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                5. Data Security
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>We implement security measures to protect your information:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest</li>
                  <li><strong>Authentication:</strong> Secure password hashing, optional 2FA</li>
                  <li><strong>Access Controls:</strong> Limited employee access, role-based permissions</li>
                  <li><strong>Monitoring:</strong> Security monitoring, intrusion detection</li>
                  <li><strong>Regular Audits:</strong> Security assessments and updates</li>
                </ul>
                <p className="mt-3 text-sm italic">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                6. Data Retention
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>We retain your information:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li><strong>Active Accounts:</strong> As long as your account is active</li>
                  <li><strong>Deleted Accounts:</strong> 30 days after deletion (for recovery), then permanently deleted</li>
                  <li><strong>Legal Requirements:</strong> Longer if required by law or ongoing legal matters</li>
                  <li><strong>Aggregate Data:</strong> Anonymized data may be retained indefinitely for analytics</li>
                </ul>
                <p className="mt-3">
                  When you delete your account, we delete your personal information within 30 days, except where we must retain it for legal compliance.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                7. Your Rights & Choices
              </h3>
              
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights:</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.1 Access & Portability</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Request a copy of your personal data</li>
                    <li>Export your data in machine-readable format</li>
                    <li>View your data in your account settings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.2 Correction & Update</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Update your profile information anytime</li>
                    <li>Correct inaccurate data</li>
                    <li>Request we fix errors in your data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.3 Deletion</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Delete your account at any time</li>
                    <li>Request deletion of specific data</li>
                    <li>We'll comply within 30 days (except legally required data)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.4 Opt-Out</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Unsubscribe from marketing emails</li>
                    <li>Disable push notifications</li>
                    <li>Opt out of analytics cookies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">7.5 Object & Restrict</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Object to certain data processing</li>
                    <li>Restrict how we use your data</li>
                    <li>Withdraw consent for optional features</li>
                  </ul>
                </div>

                <p className="mt-3 font-semibold">
                  To exercise these rights, contact us at privacy@accountableme.ai or use settings in your account.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                8. Cookies & Tracking Technologies
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>We use cookies and similar technologies:</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Types of Cookies:</h4>
                  <ul className="ml-6 list-disc space-y-1">
                    <li><strong>Essential Cookies:</strong> Required for login, security, basic functionality</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences, settings</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                    <li><strong>Performance Cookies:</strong> Monitor and improve site performance</li>
                  </ul>
                </div>

                <p className="mt-3">
                  You can control cookies through your browser settings. Disabling essential cookies may affect functionality.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                9. Third-Party Services
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>We integrate with third-party services:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li><strong>Supabase:</strong> Database hosting and authentication</li>
                  <li><strong>Resend:</strong> Email delivery</li>
                  <li><strong>Sightengine:</strong> Image content moderation</li>
                </ul>
                <p className="mt-3">
                  These services have their own privacy policies. We encourage you to review them. We're not responsible for their privacy practices.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                10. Children's Privacy
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">
                  Discovering Me is not intended for users under 18 years old.
                </p>
                <p>
                  We do not knowingly collect information from children under 18. If you're a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We'll delete such information promptly.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                11. International Users
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>
                  Discovering Me is based in the United States. If you're accessing from outside the US, your information will be transferred to, stored, and processed in the United States.
                </p>
                <p>
                  By using our services, you consent to this transfer. We comply with applicable data protection laws and use standard contractual clauses where required.
                </p>
                <div className="mt-3 bg-gray-50 rounded p-3">
                  <p className="font-semibold text-gray-900 mb-1">For EU/EEA Users:</p>
                  <p className="text-sm">
                    Under GDPR, you have additional rights including data portability, right to be forgotten, and right to lodge complaints with supervisory authorities.
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="font-semibold text-gray-900 mb-1">For California Users:</p>
                  <p className="text-sm">
                    Under CCPA, you have rights to know what personal information we collect, delete your information, and opt-out of sale (though we don't sell data).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                12. Changes to Privacy Policy
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <p>
                  We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date.
                </p>
                <p>
                  For significant changes, we'll notify you via:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Email notification</li>
                  <li>In-app notification</li>
                  <li>Prominent notice on our website</li>
                </ul>
                <p className="mt-3">
                  Your continued use after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                13. Contact Us
              </h3>
              
              <div className="space-y-3 text-blue-900">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or your personal information:
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> privacy@accountableme.ai</p>
                  <p><strong>Support:</strong> support@accountableme.ai</p>
                  <p><strong>Mailing Address:</strong></p>
                  <p className="ml-4">
                    Discovering Me / Accountable<br />
                    [Your Business Address]<br />
                    [City, State ZIP]
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  We'll respond to your inquiries within 30 days.
                </p>
              </div>
            </section>
          </div>

          {/* Version & Date */}
          <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>Privacy Policy Version: {PRIVACY_POLICY_VERSION}</p>
            <p>Last Updated: {LAST_UPDATED}</p>
            <p className="mt-2">Effective Date: {LAST_UPDATED}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {!hasScrolled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
              ⬆️ Please scroll to read the entire privacy policy
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-[#1a2332] text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#2d3e50] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
