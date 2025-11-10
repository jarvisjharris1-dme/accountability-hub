import React from 'react';

interface VerificationEmailTemplateProps {
  userName: string;
  verificationLink: string;
  expiryHours?: number;
}

export const VerificationEmailTemplate: React.FC<VerificationEmailTemplateProps> = ({
  userName,
  verificationLink,
  expiryHours = 24
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#4F46E5', padding: '30px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>Verify Your Email</h1>
      </div>
      
      <div style={{ backgroundColor: '#ffffff', padding: '40px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Hi {userName},
        </p>
        
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Thank you for signing up! Please verify your email address to activate your account and access all features.
        </p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={verificationLink}
            style={{
              backgroundColor: '#4F46E5',
              color: '#ffffff',
              padding: '14px 32px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Verify Email Address
          </a>
        </div>
        
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '30px' }}>
          This link will expire in {expiryHours} hours. If you didn't create an account, you can safely ignore this email.
        </p>
        
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style={{ fontSize: '12px', color: '#4F46E5', wordBreak: 'break-all', marginTop: '8px' }}>
            {verificationLink}
          </p>
        </div>
      </div>
    </div>
  );
};
