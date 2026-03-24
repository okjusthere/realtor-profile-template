import { ENV } from "./env";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email using the Resend API (https://resend.com).
 * Falls back gracefully if API key is not configured.
 * 
 * To use a different email provider (SendGrid, SES, SMTP), 
 * just replace the fetch call below with your provider's SDK.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.resendApiKey) {
    console.warn("[Email] Email service not configured (set RESEND_API_KEY)");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.resendApiKey}`,
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}

// ─── Email Template Generators ──────────────────────────────────
// These are pure functions that generate HTML — no platform dependency.

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Generate notification email HTML for contact form submissions
 */
export function generateContactNotificationEmail(
  senderName: string,
  senderEmail: string,
  senderPhone: string | null,
  subject: string,
  message: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Contact Form Submission</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> ${escapeHtml(senderName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></p>
        ${senderPhone ? `<p><strong>Phone:</strong> ${escapeHtml(senderPhone)}</p>` : ""}
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This message is for ${escapeHtml(targetMemberName)} from Kevv AI Inc.</p>
      </div>
    </div>
  `;
}

/**
 * Generate confirmation email HTML for contact form senders
 */
export function generateConfirmationEmail(
  senderName: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50;">Thank You for Contacting Us</h2>
      
      <div style="margin: 20px 0;">
        <p>Dear ${escapeHtml(senderName)},</p>
        <p>We've received your message and ${escapeHtml(targetMemberName)} will get back to you shortly.</p>
        <p>Thank you for reaching out!</p>
        <p>Best regards,<br/>${escapeHtml(targetMemberName)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">© 2026 Kevv AI Inc. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate lead notification email for AI chat captures
 */
export function generateLeadNotificationEmail(
  name: string,
  email: string,
  phone: string | null,
  conversationSummary: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">🎯 New AI Chat Lead</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">AI Conversation Summary</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(conversationSummary)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This lead was captured for ${escapeHtml(targetMemberName)} | Kevv AI Inc.</p>
      </div>
    </div>
  `;
}

/**
 * Generate auto follow-up email sent TO the lead after they share their info.
 * This is the key conversion touchpoint — makes the agent look responsive
 * and professional even before they manually reply.
 */
export function generateLeadFollowUpEmail(
  leadName: string,
  agentName: string,
  agentTitle: string,
  agentBrokerage: string,
  agentPhone: string | null,
  agentPhotoUrl: string | null,
  conversationSummary: string
): string {
  const firstName = leadName.split(" ")[0];
  const agentFirstName = agentName.split(" ")[0];

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        ${agentPhotoUrl 
          ? `<img src="${escapeHtml(agentPhotoUrl)}" alt="${escapeHtml(agentName)}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #DAA520; object-fit: cover; margin-bottom: 12px;" />`
          : `<div style="width: 80px; height: 80px; border-radius: 50%; background: #DAA520; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white;">👤</div>`
        }
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${escapeHtml(agentName)}</h1>
        <p style="color: #DAA520; margin: 4px 0 0; font-size: 14px; letter-spacing: 1px;">${escapeHtml(agentTitle)} · ${escapeHtml(agentBrokerage)}</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi ${escapeHtml(firstName)},
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thank you for reaching out! I received your information from our chat and wanted to follow up personally.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DAA520;">
          <p style="font-size: 14px; color: #666; margin: 0 0 8px; font-weight: bold;">From our conversation:</p>
          <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.5;">
            ${escapeHtml(conversationSummary).slice(0, 150)}${conversationSummary.length > 150 ? "…" : ""}
          </p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          I'd love to continue our conversation and help you with your real estate needs. Feel free to reach me directly:
        </p>

        <!-- Contact CTA -->
        <div style="text-align: center; margin: 25px 0;">
          ${agentPhone 
            ? `<a href="tel:${escapeHtml(agentPhone)}" style="display: inline-block; background: #1a1a2e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">📞 Call ${escapeHtml(agentFirstName)} — ${escapeHtml(agentPhone)}</a>`
            : `<a href="mailto:reply" style="display: inline-block; background: #1a1a2e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">💬 Reply to This Email</a>`
          }
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Looking forward to connecting!
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 0;">
          Best,<br/>
          <strong>${escapeHtml(agentName)}</strong><br/>
          <span style="color: #888; font-size: 14px;">${escapeHtml(agentTitle)} · ${escapeHtml(agentBrokerage)}</span>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${escapeHtml(agentBrokerage)} · Powered by Kevv AI
        </p>
      </div>
    </div>
  `;
}

