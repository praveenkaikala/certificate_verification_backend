const nodemailer =require("nodemailer");

const sendOtp = async ( email,otp , role, purpose = "login") => {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Define dynamic message parts
    const appName = "CertificateChain"; // your blockchain app name
    const purposeText =
      purpose === "approval"
        ? "to approve your institute registration"
        : purpose === "reset"
        ? "to reset your password"
        : purpose==="login"?
        "to approve your login":"to verify your account";

    // Role-based color
    const roleColor =
      role === "admin"
        ? "#2d6cdf"
        : role === "institute"
        ? "#00b894"
        : "#6c5ce7";

    const mailOptions = {
      from: `${appName} <${process.env.EMAIL}>`,
      to: email,
      subject: `${appName} OTP for ${purposeText}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              background-color: #f8f9fb;
              padding: 20px;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 12px;
              max-width: 520px;
              margin: auto;
              padding: 30px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            }
            .header {
              text-align: center;
              font-size: 24px;
              color: ${roleColor};
              margin-bottom: 16px;
              font-weight: 600;
            }
            .otp-box {
              background-color: #f3f4f6;
              padding: 20px;
              font-size: 34px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              border-radius: 8px;
              color: #333;
            }
            .footer {
              margin-top: 25px;
              font-size: 14px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">${appName} OTP Verification</div>
            <p>Hi <strong>${email.split("@")[0]}</strong>,</p>
            <p>Your One-Time Password (OTP) ${purposeText} is:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP will expire in <strong>10 minutes</strong>. Please do not share it with anyone.</p>
            <div class="footer">
              Secured by Blockchain Technology<br>
              — Team ${appName}
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send mail
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
  }
};

module.exports= sendOtp;
