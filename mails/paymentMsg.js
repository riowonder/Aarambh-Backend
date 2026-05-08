import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPaymentMail = async (
    plan,
    amount,
    start_date,
    extra_days,
    end_date,
    email,
    name,
    dob,
    phone_number
) => {
    // Format dates to Indian format (DD/MM/YYYY)
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);

    const mailOptions = {
        from: `"Aarambh Fitness" <${process.env.OTP_EMAIL}>`,
        to: email,
        subject: "Your Aarambh Fitness Subscription Details",
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
                                
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 5%; text-align: center;">
                                        <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                            <div style="width: 48px; height: 48px; background-color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 28px;">✓</span>
                                            </div>
                                        </div>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                            Subscription Confirmed
                                        </h1>
                                        <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                            Welcome to Aarambh Fitness
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
                                            Thank you for purchasing a membership at <strong style="font-weight: 600; color: #1d1d1f;">Aarambh Fitness</strong>. 
                                            Your subscription has been successfully activated and you're ready to start your fitness journey.
                                        </p>

                                        <!-- Subscription Summary Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 28px 5%;">
                                                    <p style="margin: 0 0 20px 0; color: #1d1d1f; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Subscription Summary
                                                    </p>
                                                    
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                                                    Membership Plan
                                                                </p>
                                                            </td>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                                                <p style="margin: 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${plan}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                                                    Amount Paid
                                                                </p>
                                                            </td>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                                                <p style="margin: 0; color: #10b981; font-size: 18px; font-weight: 700;">
                                                                    ₹${amount}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                                                    Start Date
                                                                </p>
                                                            </td>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                                                <p style="margin: 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${formattedStartDate}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                                                    Extra Days
                                                                </p>
                                                            </td>
                                                            <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                                                <p style="margin: 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${extra_days} Days
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 14px 0;">
                                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                                                    Expiry Date
                                                                </p>
                                                            </td>
                                                            <td style="padding: 14px 0; text-align: right;">
                                                                <p style="margin: 0; color: #1d1d1f; font-size: 16px; font-weight: 600;">
                                                                    ${formattedEndDate}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Login Credentials Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; border: 1px solid #93c5fd; margin-bottom: 32px;">
                                            <tr>
                                                <td style="padding: 28px 5%;">
                                                    <p style="margin: 0 0 20px 0; color: #1e40af; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Your Login Details
                                                    </p>
                                                    
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding: 12px 0; border-bottom: 1px solid rgba(147, 197, 253, 0.5);">
                                                                <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">
                                                                    Phone Number
                                                                </p>
                                                                <p style="margin: 6px 0 0 0; color: #1e3a8a; font-size: 16px; font-weight: 600;">
                                                                    ${phone_number}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 12px 0 0 0;">
                                                                <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">
                                                                    Password (Date of Birth)
                                                                </p>
                                                                <p style="margin: 6px 0 0 0; color: #1e3a8a; font-size: 16px; font-weight: 600;">
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
                                                    <a href="https://aarambhfitness.in/user-login" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">
                                                        Login to Your Account
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                            If you have any questions regarding your membership or payment, feel free to contact the Aarambh Fitness team.
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
        console.log("Payment confirmation email sent successfully");
    } catch (error) {
        console.error("Error sending payment email:", error);
    }
};
