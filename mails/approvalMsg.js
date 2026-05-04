import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendApprovalEmail = async (email, name, dob) => {
    const mailOptions = {
        from: `"Aarambh Gym Admin" <${process.env.OTP_EMAIL}>`,
        to: email,
        subject: "🎉 Your Aarambh Account Has Been Approved!",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #111827; margin-bottom: 5px;">Welcome to Aarambh</h2>
                    <p style="color: #6b7280; font-size: 14px;">Your account has been successfully approved</p>
                </div>

                <p style="color: #374151;">Hi <strong>${name}</strong>,</p>

                <p style="color: #374151;">
                    We're excited to inform you that your account has been approved by <strong>Aarambh Gym</strong>.
                    You can now log in and start using your account.
                </p>

                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #111827;"><strong>Login Credentials:</strong></p>
                    <p style="margin: 8px 0; color: #374151;">📧 Email: <strong>${email}</strong></p>
                    <p style="margin: 8px 0; color: #374151;">🔑 Password (DOB): <strong>${dob}</strong></p>
                </div>

                <p style="color: #374151;">
                    Please keep your credentials secure and consider updating your password after your first login.
                </p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="http://localhost:5173/user-login" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                        Login to Your Account
                    </a>
                </div>

                <p style="color: #6b7280; font-size: 14px;">
                    If you have any questions or need assistance, feel free to contact us.
                </p>

                <br/>

                <p style="color: #374151; margin-bottom: 0;">Best regards,</p>
                <p style="color: #111827; font-weight: 600; margin-top: 4px;">Aarambh Gym Team</p>

            </div>
        `
    };

    try {
        await resend.emails.send(mailOptions);
    } catch (error) {
        console.error("Error sending approval email:", error);
    }
};
