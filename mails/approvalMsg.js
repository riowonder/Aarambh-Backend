import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendApprovalEmail = async (email, name, dob) => {
    const mailOptions = {
        from: `"Aarambh Fitness" <${process.env.OTP_EMAIL}>`,
        to: email,
        subject: "Your Aarambh Fitness Account Has Been Approved!",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7;">
                    <tr>
                        <td align="center" style="padding: 0;">
                            <!-- Main Container -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 100%; background-color: #ffffff;">
                                
                                <!-- Header with gradient -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 5%; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                            Welcome to Aarambh Fitness
                                        </h1>
                                        <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                            Your account has been approved
                                        </p>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 48px 5%;">
                                        <p style="margin: 0 0 24px 0; color: #1d1d1f; font-size: 17px; line-height: 1.6;">
                                            Hi <strong style="font-weight: 600;">${name}</strong>,
                                        </p>

                                        <p style="margin: 0 0 32px 0; color: #424245; font-size: 16px; line-height: 1.7;">
                                            Great news! Your account has been approved by <strong style="font-weight: 600; color: #1d1d1f;">Aarambh Fitness</strong>. 
                                            You're all set to begin your fitness journey with us.
                                        </p>

                                        <!-- Credentials Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 32px;">
                                            <tr>
                                                <td style="padding: 28px 5%;">
                                                    <p style="margin: 0 0 20px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Your Login Credentials
                                                    </p>
                                                    
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">
                                                                    Email
                                                                </p>
                                                                <p style="margin: 6px 0 0 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${email}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 12px 0 0 0;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">
                                                                    Password (Date of Birth)
                                                                </p>
                                                                <p style="margin: 6px 0 0 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${dob}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>


                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="https://aarambhfitness.in/user-login" style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">
                                                        Login to Your Account
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                            If you have any questions or need assistance, feel free to contact us.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 32px 5%; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0 0 4px 0; color: #424245; font-size: 15px;">
                                            Best regards,
                                        </p>
                                        <p style="margin: 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                            Aarambh Fitness Team
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    };

    try {
        await resend.emails.send(mailOptions);
    } catch (error) {
        console.error("Error sending approval email:", error);
    }
};
