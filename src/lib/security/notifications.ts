// Email Notifications for Security Events
// Sends alerts for sensitive account changes

import prisma from "@/lib/prisma";

// Email template types
export type SecurityEmailType =
  | "PASSWORD_CHANGED"
  | "NEW_DEVICE_LOGIN"
  | "EMAIL_CHANGE_REQUEST"
  | "SESSION_REVOKED";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Send email using your preferred provider
// This is a placeholder - integrate with your email provider (Resend, SendGrid, etc.)

async function sendEmail(data: EmailData): Promise<boolean> {
  // TODO: Integrate with email provider
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'CreatorConnect <security@creatorconnect.com>',
  //   to: data.to,
  //   subject: data.subject,
  //   html: data.html,
  // });

  console.log("[EMAIL NOTIFICATION]", {
    to: data.to,
    subject: data.subject,
    // In development, log the email content
    text: process.env.NODE_ENV === "development" ? data.text : "[REDACTED]",
  });

  return true;
}

// Get user email by ID
async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

// Format date for email display
function formatDate(date: Date): string {
  return date.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

// Notify user of password change
export async function notifyPasswordChange(
  userId: string,
  ipAddress?: string | null
): Promise<void> {
  const email = await getUserEmail(userId);
  if (!email) return;

  const now = formatDate(new Date());

  await sendEmail({
    to: email,
    subject: "🔐 Your password was changed - CreatorConnect",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Password Changed</h2>
        <p>Your CreatorConnect password was changed on <strong>${now}</strong>.</p>
        ${ipAddress ? `<p style="color: #666;">IP Address: ${ipAddress}</p>` : ""}
        <p style="margin-top: 20px;">If you did not make this change, please:</p>
        <ol>
          <li>Reset your password immediately at <a href="${process.env.NEXTAUTH_URL}/login">login page</a></li>
          <li>Contact our support team</li>
        </ol>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px;">
          This is an automated security notification from CreatorConnect.
        </p>
      </div>
    `,
    text: `Your password was changed on ${now}. If you did not make this change, reset your password immediately and contact support.`,
  });
}

// Notify user of new device login
export async function notifyNewDeviceLogin(
  userId: string,
  deviceInfo: {
    ipAddress?: string | null;
    userAgent?: string | null;
    location?: string;
  }
): Promise<void> {
  const email = await getUserEmail(userId);
  if (!email) return;

  const now = formatDate(new Date());

  // Parse user agent for readable device info
  const device = deviceInfo.userAgent
    ? parseUserAgent(deviceInfo.userAgent)
    : "Unknown device";

  await sendEmail({
    to: email,
    subject: "🔔 New login to your account - CreatorConnect",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">New Sign-in Detected</h2>
        <p>We noticed a new sign-in to your CreatorConnect account:</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 16px 8px 0; color: #666;">Time:</td>
            <td style="padding: 8px 0;"><strong>${now}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; color: #666;">Device:</td>
            <td style="padding: 8px 0;"><strong>${device}</strong></td>
          </tr>
          ${
            deviceInfo.ipAddress
              ? `<tr>
            <td style="padding: 8px 16px 8px 0; color: #666;">IP Address:</td>
            <td style="padding: 8px 0;"><strong>${deviceInfo.ipAddress}</strong></td>
          </tr>`
              : ""
          }
        </table>
        <p>If this was you, you can ignore this email.</p>
        <p style="margin-top: 20px;">If you don't recognize this activity:</p>
        <ol>
          <li>Change your password immediately</li>
          <li>Sign out of all devices in Settings</li>
          <li>Contact our support team</li>
        </ol>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px;">
          This is an automated security notification from CreatorConnect.
        </p>
      </div>
    `,
    text: `New sign-in detected on ${now} from ${device}. IP: ${deviceInfo.ipAddress || "Unknown"}. If this wasn't you, change your password immediately.`,
  });
}

// Notify user of email change request
export async function notifyEmailChangeRequest(
  currentEmail: string,
  newEmail: string,
  ipAddress?: string | null
): Promise<void> {
  const now = formatDate(new Date());

  // Send to CURRENT email (to alert if hijacked)
  await sendEmail({
    to: currentEmail,
    subject: "⚠️ Email change requested - CreatorConnect",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Email Change Requested</h2>
        <p>A request was made to change your email address on <strong>${now}</strong>.</p>
        <p>New email: <strong>${newEmail}</strong></p>
        ${ipAddress ? `<p style="color: #666;">IP Address: ${ipAddress}</p>` : ""}
        <p style="margin-top: 20px; color: #c00;">
          If you did not request this change, your account may be compromised. 
          Please change your password immediately and contact support.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px;">
          This is an automated security notification from CreatorConnect.
        </p>
      </div>
    `,
    text: `An email change was requested for your account to ${newEmail}. If you did not make this request, change your password immediately.`,
  });
}

// Notify user of session revocation (sign out all devices)
export async function notifySessionRevoked(userId: string): Promise<void> {
  const email = await getUserEmail(userId);
  if (!email) return;

  const now = formatDate(new Date());

  await sendEmail({
    to: email,
    subject: "🔒 All devices signed out - CreatorConnect",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">All Devices Signed Out</h2>
        <p>All devices were signed out of your CreatorConnect account on <strong>${now}</strong>.</p>
        <p>If you did this, you can ignore this email.</p>
        <p style="margin-top: 20px;">If you didn't do this, please:</p>
        <ol>
          <li>Reset your password immediately</li>
          <li>Contact our support team</li>
        </ol>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px;">
          This is an automated security notification from CreatorConnect.
        </p>
      </div>
    `,
    text: `All devices were signed out of your account on ${now}. If you didn't do this, reset your password immediately.`,
  });
}

// Simple user agent parser
function parseUserAgent(ua: string): string {
  // Browser detection
  let browser = "Unknown Browser";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  // OS detection
  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} on ${os}`;
}
