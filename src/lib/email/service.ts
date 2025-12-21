// Email Service using SendGrid
// Handles all transactional emails for security notifications

import sgMail from "@sendgrid/mail";

const FROM_EMAIL = "noreply@creatorconnect.com";
const FROM_NAME = "CreatorConnect";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Email] SendGrid API key not configured, skipping email");
    return false;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });
    console.log(`[Email] Sent "${options.subject}" to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// Security notification templates

export async function sendPasswordChangedEmail(
  to: string,
  userName: string
): Promise<boolean> {
  const subject = "Your password was changed";
  const text = `Hi ${userName},

Your CreatorConnect password was just changed.

If you did this, you can safely ignore this email.

If you didn't change your password, please contact support immediately and secure your account by resetting your password.

- The CreatorConnect Security Team`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Password Changed</h2>
    <p>Hi ${userName},</p>
    <p>Your CreatorConnect password was just changed.</p>
    <p>If you did this, you can safely ignore this email.</p>
    <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
      <strong>If you didn't change your password</strong>, please contact support immediately and secure your account by resetting your password.
    </p>
    <p style="color: #6b7280; font-size: 14px;">- The CreatorConnect Security Team</p>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, text, html });
}

export async function sendNewLoginEmail(
  to: string,
  userName: string,
  details: {
    ip?: string;
    userAgent?: string;
    location?: string;
    time: Date;
  }
): Promise<boolean> {
  const subject = "New login to your account";
  const timeStr = details.time.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  
  const text = `Hi ${userName},

We noticed a new sign-in to your CreatorConnect account.

Time: ${timeStr}
${details.ip ? `IP Address: ${details.ip}` : ""}
${details.location ? `Location: ${details.location}` : ""}
${details.userAgent ? `Device: ${details.userAgent}` : ""}

If this was you, you can safely ignore this email.

If you don't recognize this sign-in, please change your password immediately and sign out of all devices from your account settings.

- The CreatorConnect Security Team`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">New Sign-In Detected</h2>
    <p>Hi ${userName},</p>
    <p>We noticed a new sign-in to your CreatorConnect account.</p>
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Time:</strong> ${timeStr}</p>
      ${details.ip ? `<p style="margin: 8px 0 0;"><strong>IP Address:</strong> ${details.ip}</p>` : ""}
      ${details.location ? `<p style="margin: 8px 0 0;"><strong>Location:</strong> ${details.location}</p>` : ""}
      ${details.userAgent ? `<p style="margin: 8px 0 0;"><strong>Device:</strong> ${details.userAgent.substring(0, 50)}...</p>` : ""}
    </div>
    <p>If this was you, you can safely ignore this email.</p>
    <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
      <strong>If you don't recognize this sign-in</strong>, please <a href="${process.env.NEXTAUTH_URL}/settings" style="color: #2563eb;">change your password</a> immediately.
    </p>
    <p style="color: #6b7280; font-size: 14px;">- The CreatorConnect Security Team</p>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, text, html });
}

export async function sendSessionsRevokedEmail(
  to: string,
  userName: string
): Promise<boolean> {
  const subject = "All devices signed out";
  const text = `Hi ${userName},

All devices have been signed out from your CreatorConnect account.

If you did this, you can safely ignore this email.

If you didn't sign out of all devices, your account may be compromised. Please reset your password immediately.

- The CreatorConnect Security Team`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">All Devices Signed Out</h2>
    <p>Hi ${userName},</p>
    <p>All devices have been signed out from your CreatorConnect account.</p>
    <p>If you did this, you can safely ignore this email.</p>
    <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
      <strong>If you didn't do this</strong>, your account may be compromised. Please <a href="${process.env.NEXTAUTH_URL}/settings" style="color: #2563eb;">reset your password</a> immediately.
    </p>
    <p style="color: #6b7280; font-size: 14px;">- The CreatorConnect Security Team</p>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, text, html });
}

export async function sendEmailChangedEmail(
  oldEmail: string,
  newEmail: string,
  userName: string
): Promise<boolean> {
  const subject = "Your email address was changed";
  const text = `Hi ${userName},

The email address on your CreatorConnect account was changed from ${oldEmail} to ${newEmail}.

If you did this, you can safely ignore this email.

If you didn't make this change, please contact support immediately.

- The CreatorConnect Security Team`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Email Address Changed</h2>
    <p>Hi ${userName},</p>
    <p>The email address on your CreatorConnect account was changed.</p>
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Old email:</strong> ${oldEmail}</p>
      <p style="margin: 8px 0 0;"><strong>New email:</strong> ${newEmail}</p>
    </div>
    <p>If you did this, you can safely ignore this email.</p>
    <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
      <strong>If you didn't make this change</strong>, please contact support immediately.
    </p>
    <p style="color: #6b7280; font-size: 14px;">- The CreatorConnect Security Team</p>
  </div>
</body>
</html>`;

  // Send to both old and new email addresses
  await sendEmail({ to: oldEmail, subject, text, html });
  return sendEmail({ to: newEmail, subject, text, html });
}
