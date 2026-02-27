import AWS from 'aws-sdk';

const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-west-1';
const fromEmail = process.env.SES_FROM_EMAIL || '';
const notificationBaseUrl = process.env.NOTIFICATION_BASE_URL || '';

const sesClient = new AWS.SES({ region });

const sendEmail = async (to: string, subject: string, textBody: string) => {
  if (!fromEmail || !to) {
    return;
  }

  await sesClient
    .sendEmail({
      Source: fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    })
    .promise();
};

const buildProvisioningSummary = (role: 'ADMIN' | 'INSTRUCTOR', recipientEmail: string) => {
  return `An account action was submitted.

Role: ${role}
Email: ${recipientEmail}
Timestamp: ${new Date().toISOString()}

If you did not expect this action, contact platform support.`;
};

export const notificationService = {
  isConfigured(): boolean {
    return fromEmail.length > 0;
  },

  async sendProvisioningNotifications(params: {
    role: 'ADMIN' | 'INSTRUCTOR';
    createdEmail: string;
    actingAdminEmail: string;
  }) {
    const { role, createdEmail, actingAdminEmail } = params;

    const recipientSubject =
      role === 'ADMIN' ? 'Your admin account is ready' : 'Your instructor account is ready';
    const signInLine = notificationBaseUrl
      ? `\nSign in: ${notificationBaseUrl.replace(/\/+$/, '')}/auth/sign-in`
      : '';
    const recipientBody =
      role === 'ADMIN'
        ? `Your ACM Cloud administrator account has been created for ${createdEmail}. You can now sign in and access admin tools.${signInLine}`
        : `Your ACM Cloud instructor account has been created for ${createdEmail}. You can now sign in and begin using instructor tools.${signInLine}`;

    const adminSubject = `${role} account provisioning submitted`;
    const adminBody = buildProvisioningSummary(role, createdEmail);

    await Promise.all([
      sendEmail(createdEmail, recipientSubject, recipientBody),
      sendEmail(actingAdminEmail, adminSubject, adminBody),
    ]);
  },
};
