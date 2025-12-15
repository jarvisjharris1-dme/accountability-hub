// TermsOfServiceModal.tsx - UPDATED VERSION
// Now includes link to Privacy Policy

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, AlertTriangle, FileText, Shield } from 'lucide-react';

const CURRENT_TERMS_VERSION = '1.0.0';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onShowPrivacyPolicy?: () => void;  // NEW: Optional callback to show privacy policy
  canClose?: boolean;
}

export function TermsOfServiceModal({ 
  isOpen, 
  onAccept, 
  onShowPrivacyPolicy,
  canClose = false 
}: TermsOfServiceModalProps) {
  const { user } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);  // NEW

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    if (!termsChecked || !disclaimerChecked || !privacyChecked) {
      alert('Please check all three boxes to continue');
      return;
    }

    setAccepting(true);
    try {
      // Record acceptance in database
      const { error: acceptanceError } = await supabase
        .from('terms_acceptances')
        .insert({
          user_id: user?.id,
          terms_version: CURRENT_TERMS_VERSION,
          acceptance_type: 'signup',
          accepted_at: new Date().toISOString()
        });

      if (acceptanceError) {
        console.error('Error recording acceptance:', acceptanceError);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: CURRENT_TERMS_VERSION
        })
        .eq('id', user?.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      onAccept();
    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('Failed to accept terms. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#1a2332]" />
            <h2 className="text-2xl font-bold text-gray-900">Terms of Service & Disclaimer</h2>
          </div>
          {canClose && (
            <button 
              onClick={onAccept}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Critical Disclaimer - Highlighted */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-3">
                  ⚠️ IMPORTANT DISCLAIMER - PLEASE READ CAREFULLY
                </h3>
                <div className="space-y-3 text-red-900">
                  <p className="font-semibold text-lg">
                    NO LIABILITY FOR ADVICE OR INFORMATION
                  </p>
                  <p>
                    By using Discovering Me ("Accountable"), you acknowledge and agree that:
                  </p>
                  <ul className="space-y-2 ml-6 list-disc">
                    <li>
                      <strong>Not Professional Services:</strong> Discovering Me, Accountable, and all affiliated entities DO NOT provide professional advice, counseling, therapy, medical, legal, or financial services.
                    </li>
                    <li>
                      <strong>Peer Support Only:</strong> This platform facilitates peer-to-peer accountability and support among users. All information, advice, suggestions, or guidance shared on this platform comes from other users, NOT licensed professionals.
                    </li>
                    <li>
                      <strong>No Liability:</strong> You hereby release and hold harmless Discovering Me, Accountable, its owners, operators, employees, affiliates, partners, and all associated entities from ANY and ALL liability, claims, damages, or losses arising from:
                      <ul className="ml-6 list-circle mt-2 space-y-1">
                        <li>Advice, information, or suggestions received from other users</li>
                        <li>Actions taken or not taken based on information from this platform</li>
                        <li>Mental health concerns, crises, or emergencies</li>
                        <li>Financial decisions or business advice</li>
                        <li>Relationship advice or personal decisions</li>
                        <li>Any harm, injury, or damage of any kind</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Seek Professional Help:</strong> If you are experiencing a mental health crisis, medical emergency, or need professional advice, you MUST contact qualified professionals, emergency services (911), or crisis hotlines (National Suicide Prevention Lifeline: 988).
                    </li>
                    <li>
                      <strong>Your Responsibility:</strong> You are solely responsible for evaluating the accuracy, completeness, and usefulness of any information or advice received through this platform and for your own decisions and actions.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Terms of Service
            </h3>
            
            <div className="space-y-4 text-gray-700">
              <section>
                <h4 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h4>
                <p>
                  By accessing or using Discovering Me / Accountable, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you may not use this service.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">2. User Conduct</h4>
                <p>You agree to:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Provide accurate information</li>
                  <li>Maintain the confidentiality of your account</li>
                  <li>Treat other users with respect and dignity</li>
                  <li>Not share harmful, illegal, or inappropriate content</li>
                  <li>Not harass, bully, or threaten other users</li>
                  <li>Not violate any applicable laws</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">3. Content Moderation</h4>
                <p>
                  We reserve the right to review, monitor, and remove any content that violates these terms, including profile pictures, messages, and posts. All profile pictures are automatically screened for inappropriate content.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">4. Privacy & Data</h4>
                <p>
                  Your use of this service is subject to our Privacy Policy. We collect and use your data as described in our Privacy Policy. You acknowledge that your participation in accountability circles means sharing certain information with circle members.
                </p>
                {onShowPrivacyPolicy && (
                  <button
                    onClick={onShowPrivacyPolicy}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Read Privacy Policy →
                  </button>
                )}
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">5. Intellectual Property</h4>
                <p>
                  All content, trademarks, and materials on this platform are owned by Discovering Me / Accountable or its licensors. You may not copy, modify, or distribute our content without permission.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">6. Termination</h4>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason. You may delete your account at any time.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h4>
                <p className="font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISCOVERING ME, ACCOUNTABLE, AND ALL AFFILIATED ENTITIES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">8. Changes to Terms</h4>
                <p>
                  We may update these terms from time to time. We will notify you of significant changes. Your continued use after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">9. Contact</h4>
                <p>
                  For questions about these terms, contact us at: support@accountableme.ai
                </p>
              </section>
            </div>
          </div>

          {/* Version & Date */}
          <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>Version {CURRENT_TERMS_VERSION}</p>
            <p>Last Updated: December 15, 2024</p>
          </div>
        </div>

        {/* Footer with Checkboxes */}
        <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
          
          {!hasScrolled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⬆️ Please scroll to read the entire terms before accepting
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                disabled={!hasScrolled}
                className="mt-1 w-5 h-5 text-[#1a2332] rounded focus:ring-[#1a2332] disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                <strong>I have read and agree to the Terms of Service</strong> and understand my obligations as a user of this platform.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                disabled={!hasScrolled}
                className="mt-1 w-5 h-5 text-[#1a2332] rounded focus:ring-[#1a2332] disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                <strong className="text-red-700">I acknowledge the disclaimer</strong> and understand that Discovering Me, Accountable, and all affiliated entities are NOT liable for any advice, information, or guidance received through this platform. I will seek professional help for serious concerns.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                disabled={!hasScrolled}
                className="mt-1 w-5 h-5 text-[#1a2332] rounded focus:ring-[#1a2332] disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                <strong>I have read and agree to the Privacy Policy</strong> and understand how my data will be collected, used, and shared.
                {onShowPrivacyPolicy && (
                  <button
                    onClick={onShowPrivacyPolicy}
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    Read Policy
                  </button>
                )}
              </span>
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!hasScrolled || !termsChecked || !disclaimerChecked || !privacyChecked || accepting}
            className="w-full bg-[#1a2332] text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#2d3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {accepting ? 'Processing...' : 'I Accept - Continue to Accountable'}
          </button>

          {!canClose && (
            <p className="text-xs text-center text-gray-500">
              You must accept these terms to use Discovering Me / Accountable
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
