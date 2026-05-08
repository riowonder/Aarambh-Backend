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
    dob
) => {
    const mailOptions = {
        from: `"Aarambh Gym Admin" <${process.env.OTP_EMAIL}>`,
        to: email,
        subject: "Your Aarambh Gym Subscription Details",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #111827; margin-bottom: 8px;">
                        Aarambh Gym
                    </h1>

                    <p style="color: #6b7280; font-size: 15px; margin: 0;">
                        Subscription Purchase Confirmation
                    </p>
                </div>

                <!-- Greeting -->
                <p style="font-size: 16px; color: #374151;">
                    Hi <strong>${name}</strong>,
                </p>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.7;">
                    Thank you for purchasing a membership at 
                    <strong>Aarambh Gym</strong>. 
                    Your subscription has been successfully activated.
                </p>

                <!-- Subscription Details -->
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">

                    <h2 style="margin-top: 0; color: #111827; font-size: 18px;">
                        Subscription Summary
                    </h2>

                    <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">
                                Membership Plan
                            </td>

                            <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">
                                ${plan}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">
                                Amount Paid
                            </td>

                            <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">
                                ₹${amount}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">
                                Start Date
                            </td>

                            <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">
                                ${start_date}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">
                                Extra Days
                            </td>

                            <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">
                                ${extra_days} Days
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">
                                Expiry Date
                            </td>

                            <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">
                                ${end_date}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Login Details -->
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin-bottom: 24px;">

                    <h3 style="margin-top: 0; color: #1d4ed8;">
                        Login Details
                    </h3>

                    <p style="margin: 8px 0; color: #374151;">
                        📧 Email: 
                        <strong>${email}</strong>
                    </p>

                    <p style="margin: 8px 0; color: #374151;">
                        🔑 Password (DOB): 
                        <strong>${dob}</strong>
                    </p>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin: 30px 0;">
                    <a 
                        href="http://localhost:5173/user-login"
                        style="
                            background-color: #2563eb;
                            color: #ffffff;
                            padding: 14px 24px;
                            border-radius: 8px;
                            text-decoration: none;
                            font-weight: 600;
                            display: inline-block;
                        "
                    >
                        Login to Your Account
                    </a>
                </div>

                <!-- Footer -->
                <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                    If you have any questions regarding your membership or payment,
                    feel free to contact the Aarambh Gym team.
                </p>

                <br />

                <p style="margin-bottom: 4px; color: #374151;">
                    Best regards,
                </p>

                <p style="margin-top: 0; font-weight: 600; color: #111827;">
                    Aarambh Gym Team
                </p>
            </div>
        `
    };

    try {
        await resend.emails.send(mailOptions);
        console.log("Payment confirmation email sent successfully");
    } catch (error) {
        console.error("Error sending payment email:", error);
    }
};
