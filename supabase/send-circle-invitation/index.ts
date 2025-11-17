import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { inviterId, inviterName, inviteeEmail, message, invitationId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const appUrl = Deno.env.get('APP_URL') || 'https://main.dq5orpdt45y7q.amplifyapp.com'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .accept { background: #10b981; color: white; }
            .decline { background: #6b7280; color: white; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 Accountability Circle Invitation</h1>
            </div>
            <div class="content">
              <h2>You've been invited!</h2>
              <p><strong>${inviterName}</strong> has invited you to join their accountability circle on Discovering Me.</p>
              
              ${message ? `<div class="message"><p><em>"${message}"</em></p></div>` : ''}
              
              <p>Accountability circles help you stay committed to your personal growth journey with trusted support.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/circle?action=accept&invitation=${invitationId}" class="button accept">
                  Accept Invitation
                </a>
                <a href="${appUrl}/circle?action=decline&invitation=${invitationId}" class="button decline">
                  Decline
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Don't have an account? <a href="${appUrl}/signup?ref=invitation">Sign up now</a> to accept this invitation.
              </p>
            </div>
            <div class="footer">
              <p>This invitation was sent to ${inviteeEmail}</p>
              <p>Discovering Me - Your Journey to Self-Discovery</p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Discovering Me <noreply@resend.dev>',
        to: [inviteeEmail],
        subject: `${inviterName} invited you to join their accountability circle`,
        html: emailHtml,
      }),
    })

    const emailData = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(`Email failed: ${JSON.stringify(emailData)}`)
    }

    const { data: recipientProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', inviteeEmail)
      .single()

    if (recipientProfile) {
      await supabaseClient.from('notifications').insert({
        user_id: recipientProfile.id,
        type: 'circle_invitation',
        title: 'Circle Invitation',
        message: `${inviterName} invited you to their accountability circle`,
        data: {
          invitation_id: invitationId,
          inviter_id: inviterId,
          inviter_name: inviterName,
        },
        read: false,
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent: true,
        notificationCreated: !!recipientProfile 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
