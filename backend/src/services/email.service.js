import nodemailer from "nodemailer";
import crypto from "crypto";

// Store temporary access codes in memory (in production, use Redis or DB)
const accessCodes = new Map();

// Configure email transporter
let transporter;
let isInitializing = false;
let initPromise = null;

async function initializeTransporter() {
  // Prevent multiple simultaneous initialization attempts
  if (isInitializing) {
    return initPromise;
  }
  
  if (transporter) {
    return transporter;
  }
  
  isInitializing = true;
  
  try {
    // If Gmail credentials are configured, use Gmail
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== "your-email@gmail.com") {
      console.log("✓ Using Gmail for email service");
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Use Ethereal test service for development
      console.log("ℹ️  Email not configured. Using test email service (Ethereal)");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
    
    return transporter;
  } finally {
    isInitializing = false;
  }
}

// Generate a random 6-digit access code
export function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send access code via email
export async function sendAccessCode(email, fileName, cid) {
  try {
    // Ensure transporter is initialized
    await initializeTransporter();
    
    const code = generateAccessCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    // Store the code
    const codeKey = `${email}:${cid}`;
    accessCodes.set(codeKey, {
      code,
      expiresAt,
      attempts: 0,
      fileName,
      cid
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com" ? process.env.EMAIL_USER : "SecureShare <test@secureshare.com>"),
      to: email,
      subject: `🔐 SecureShare - Access Code for "${fileName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🔒 SecureShare</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Secure File Sharing Platform</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
            <h3 style="color: #333; margin-top: 0;">Access Code Required</h3>
            
            <p style="color: #666; line-height: 1.6;">
              You requested access to download the following file:
            </p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
              <strong style="color: #333;">File Name:</strong> ${fileName}<br>
              <strong style="color: #333;">Request Time:</strong> ${new Date().toLocaleString()}
            </div>
            
            <p style="color: #666; margin: 20px 0 0 0;">
              <strong>Your 6-digit access code is:</strong>
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0;">
              <h1 style="margin: 0; font-size: 36px; letter-spacing: 5px;">${code}</h1>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
              ⏰ This code expires in 15 minutes<br>
              🔒 This code can only be used once<br>
              ⚠️ Do not share this code with anyone
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this code, please ignore this email.<br>
              <strong>SecureShare</strong> - Encrypted File Sharing Platform
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    // For Ethereal test emails, provide a preview URL
    if (process.env.EMAIL_USER === "your-email@gmail.com" || !process.env.EMAIL_USER) {
      const testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`✓ Test email preview: ${testPreviewUrl}`);
      }
    }
    
    console.log(`✓ Access code sent to ${email} for file ${cid}`);
    return { success: true, expiresIn: 900 }; // 15 minutes in seconds
  } catch (err) {
    console.error("Email send error:", err);
    throw new Error("Failed to send access code: " + err.message);
  }
}

// Verify access code
export function verifyAccessCode(email, cid, code) {
  const codeKey = `${email}:${cid}`;
  const stored = accessCodes.get(codeKey);

  if (!stored) {
    return { valid: false, message: "No access code found for this file" };
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    accessCodes.delete(codeKey);
    return { valid: false, message: "Access code has expired" };
  }

  // Check attempts (max 5 attempts)
  if (stored.attempts >= 5) {
    accessCodes.delete(codeKey);
    return { valid: false, message: "Too many failed attempts. Request a new code." };
  }

  // Verify code
  if (stored.code !== code) {
    stored.attempts += 1;
    return { valid: false, message: `Invalid code. ${5 - stored.attempts} attempts remaining.` };
  }

  // Code is valid - delete it
  accessCodes.delete(codeKey);
  return { valid: true, message: "Access granted" };
}

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of accessCodes.entries()) {
    if (now > value.expiresAt) {
      accessCodes.delete(key);
    }
  }
}, 60000); // Every minute
// Send compliance report via email
export async function sendComplianceReport(email, reportData) {
  try {
    // Ensure transporter is initialized
    await initializeTransporter();
    
    const reportGenerator = require('./report.generator');
    
    const report = reportData.overallReport 
      ? reportGenerator.generateOverallReport(reportData)
      : reportData.complianceReport
      ? reportGenerator.generateComplianceSummary(reportData.complianceReport)
      : reportGenerator.generateComplianceSummary(reportData);

    const htmlContent = reportGenerator.reportToHTML(report, 'compliance');

    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com" ? process.env.EMAIL_USER : "SecureShare <test@secureshare.com>"),
      to: email,
      subject: `📋 SecureShare - Compliance Report (${report.generatedDate})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.EMAIL_USER === "your-email@gmail.com" || !process.env.EMAIL_USER) {
      const testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`✓ Test email preview: ${testPreviewUrl}`);
      }
    }

    console.log(`✓ Compliance report sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Error sending compliance report:", err);
    throw new Error("Failed to send compliance report: " + err.message);
  }
}

// Send activity report via email
export async function sendActivityReport(email, reportData) {
  try {
    // Ensure transporter is initialized
    await initializeTransporter();
    
    const reportGenerator = require('./report.generator');
    
    const report = reportGenerator.generateActivityReport(reportData);
    const htmlContent = reportGenerator.reportToHTML(report, 'activity');

    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com" ? process.env.EMAIL_USER : "SecureShare <test@secureshare.com>"),
      to: email,
      subject: `📊 SecureShare - Activity Report (${report.generatedDate})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.EMAIL_USER === "your-email@gmail.com" || !process.env.EMAIL_USER) {
      const testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`✓ Test email preview: ${testPreviewUrl}`);
      }
    }

    console.log(`✓ Activity report sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Error sending activity report:", err);
    throw new Error("Failed to send activity report: " + err.message);
  }
}

// Send audit report via email
export async function sendAuditReport(email, reportData) {
  try {
    // Ensure transporter is initialized
    await initializeTransporter();
    
    const reportGenerator = require('./report.generator');
    
    const report = reportGenerator.generateAuditReport(reportData);
    const htmlContent = reportGenerator.reportToHTML(report, 'audit');

    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com" ? process.env.EMAIL_USER : "SecureShare <test@secureshare.com>"),
      to: email,
      subject: `🔍 SecureShare - Audit Report (${new Date().toLocaleDateString()})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.EMAIL_USER === "your-email@gmail.com" || !process.env.EMAIL_USER) {
      const testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`✓ Test email preview: ${testPreviewUrl}`);
      }
    }

    console.log(`✓ Audit report sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Error sending audit report:", err);
    throw new Error("Failed to send audit report: " + err.message);
  }
}

// Send overall system report via email
export async function sendOverallReport(email, reportData) {
  try {
    // Ensure transporter is initialized
    await initializeTransporter();
    
    const reportGenerator = require('./report.generator');
    
    const report = reportGenerator.generateOverallReport(reportData);
    const htmlContent = reportGenerator.reportToHTML(report, 'overall');

    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com" ? process.env.EMAIL_USER : "SecureShare <test@secureshare.com>"),
      to: email,
      subject: `📈 SecureShare - Overall System Report (${report.generatedDate})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.EMAIL_USER === "your-email@gmail.com" || !process.env.EMAIL_USER) {
      const testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`✓ Test email preview: ${testPreviewUrl}`);
      }
    }

    console.log(`✓ Overall system report sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Error sending overall report:", err);
    throw new Error("Failed to send overall report: " + err.message);
  }
}