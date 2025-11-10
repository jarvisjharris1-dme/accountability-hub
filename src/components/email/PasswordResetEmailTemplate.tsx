interface PasswordResetEmailTemplateProps {
  userName: string;
  resetLink: string;
  expiryHours?: number;
}

export function PasswordResetEmailTemplate({ 
  userName, 
  resetLink, 
  expiryHours = 24 
}: PasswordResetEmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: '#6366f1', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>Reset Your Password</h1>
      </div>
      
      <div style={{ backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '8px', margin: '20px' }}>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
          Hi {userName},
        </p>
        
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={resetLink}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '14px 32px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Reset Password
          </a>
        </div>
        
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
          This link will expire in {expiryHours} hours. If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '6px', 
          padding: '15px', 
          marginTop: '20px' 
        }}>
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
            <strong>Security tip:</strong> Never share your password or reset link with anyone.
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2025 Your App. All rights reserved.</p>
        <p style={{ margin: '5px 0' }}>If the button doesn't work, copy and paste this link:</p>
        <p style={{ margin: '5px 0', wordBreak: 'break-all' }}>{resetLink}</p>
      </div>
    </div>
  );
}
