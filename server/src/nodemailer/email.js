import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplted.js";
import transporter from "./nodemailer.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your email",
      text: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    };

    await transporter.sendMail(mailOptions);

    console.log("Email send successfully");
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};
