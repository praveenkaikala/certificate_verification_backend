const nodemailer = require("nodemailer");
const baseTemplate = ({ title, content }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      padding: 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
      font-size: 15px;
    }
    .content h2 {
      color: #111827;
    }
    .badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      margin-top: 10px;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 22px;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
    }
    .code {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      word-break: break-all;
      margin-top: 10px;
    }
    .footer {
      background: #f9fafb;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SkillChain</h1>
    </div>

    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} SkillChain • Blockchain Certificate Verification System
    </div>
  </div>
</body>
</html>
`;

/* =========================
   SEND MAIL WRAPPER
========================= */
 const sendMail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
  await transporter.sendMail({
    from: `"SkillChain" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};


const sendInstituteVerificationEmail = async ({
  instituteEmail,
  instituteName,
}) => {
  const html = baseTemplate({
    title: "Institute Verified Successfully",
    content: `
      <p>Dear <b>${instituteName}</b>,</p>
      <p>
        We are pleased to inform you that your institute has been
        <b>successfully verified</b> by the system administrator.
      </p>

      <span class="badge">Status: Approved</span>

      <p>
        You can now issue blockchain-verified academic certificates
        to approved students.
      </p>

      <a href="#" class="button">Go to Institute Dashboard</a>

      <p style="margin-top:30px;">
        Regards,<br/>
        <b>SkillChain Team</b>
      </p>
    `,
  });

  await sendMail({
    to: instituteEmail,
    subject: "Institute Verification Approved – SkillChain",
    html,
  });
};


const sendCertificateIssuedEmail = async ({
  studentEmail,
  studentName,
  courseName,
  transactionHash,
}) => {
  const html = baseTemplate({
    title: "Certificate Issued Successfully",
    content: `
      <p>Hello <b>${studentName}</b>,</p>
      <p>
        Your certificate for the course
        <b>${courseName}</b> has been successfully issued and
        recorded on the blockchain.
      </p>

      <span class="badge">Blockchain Record</span>

      <p><b>Transaction Hash:</b></p>
      <div class="code">${transactionHash}</div>

      <p>
        You can use this transaction hash to verify the authenticity
        of your certificate anytime.
      </p>

      <a href="#" class="button">Verify Certificate</a>

      <p style="margin-top:30px;">
        Regards,<br/>
        <b>SkillChain Team</b>
      </p>
    `,
  });

  await sendMail({
    to: studentEmail,
    subject: "Certificate Issued – SkillChain",
    html,
  });
};

const sendStudentVerificationEmail = async ({
  studentEmail,
  studentName,
  instituteName,
}) => {
  const html = baseTemplate({
    title: "Student Verification Approved",
    content: `
      <p>Hello <b>${studentName}</b>,</p>
      <p>
        Your student profile has been successfully verified by
        <b>${instituteName}</b>.
      </p>

      <span class="badge">Status: Verified</span>

      <p>
        You are now eligible to receive blockchain-verified certificates
        through SkillChain.
      </p>

      <a href="#" class="button">View Profile</a>

      <p style="margin-top:30px;">
        Regards,<br/>
        <b>SkillChain Team</b>
      </p>
    `,
  });

  await sendMail({
    to: studentEmail,
    subject: "Student Verification Successful – SkillChain",
    html,
  });
};


module.exports={sendCertificateIssuedEmail,sendStudentVerificationEmail,sendInstituteVerificationEmail}