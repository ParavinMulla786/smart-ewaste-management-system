package com.ewaste.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email Service
 * 
 * Handles sending emails for user verification and notifications
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;

    /**
     * Send verification email with password setup link
     * 
     * @param toEmail User's email address
     * @param userName User's name
     * @param verificationToken Unique verification token
     */
    public void sendVerificationEmail(String toEmail, String userName, String verificationToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Smart e-Waste - Email Verification & Password Setup");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:30px;text-align:center}.header img{width:80px;height:80px;margin-bottom:10px}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0;text-align:center}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}.icon{font-size:40px;margin:20px 0}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>♻️</div>" +
                "<h1>Smart e-Waste Portal</h1>" +
                "<p style='color:#fff;margin:10px 0'>Welcome to Sustainable E-Waste Management</p>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#667eea'>Hello %s! 👋</h2>" +
                "<p>Thank you for registering with <strong>Smart e-Waste Collection & Management System!</strong></p>" +
                "<p>Your registration has been approved by our admin team.</p>" +
                "<div style='background:#e7f3ff;border-left:4px solid #667eea;padding:15px;margin:20px 0'>" +
                "<strong>⏰ Next Steps:</strong><br>" +
                "Our admin team will contact you shortly with instructions to complete your account setup and create your password." +
                "</div>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you didn't create this account, please ignore this email.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "<p style='margin-top:15px'>This is an automated message. Please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Verification email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    /**
     * Send password reset successful notification
     * 
     * @param toEmail User's email address
     * @param userName User's name
     */
    public void sendPasswordSetSuccessEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Smart e-Waste - Account Activated Successfully!");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#10b981 0%%,#059669 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#10b981 0%%,#059669 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0;text-align:center}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}.success-icon{font-size:60px;margin:20px 0}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>✅</div>" +
                "<h1>Account Activated!</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#10b981'>Congratulations %s! 🎉</h2>" +
                "<p>Your email has been verified and your password has been set successfully!</p>" +
                "<p>Your account is now <strong>active</strong>. You can now login to the Smart e-Waste system and start scheduling e-waste pickups.</p>" +
                "<div style='background:#d1fae5;border-left:4px solid #10b981;padding:15px;margin:20px 0'>" +
                "<strong>✨ What's Next?</strong><br>" +
                "• Login to the Smart e-Waste portal<br>" +
                "• Schedule your first e-waste pickup<br>" +
                "• Track your requests in real-time<br>" +
                "• Contribute to a sustainable future" +
                "</div>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Account activation email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
        }
    }

    /**
     * Send pickup person registration email with temporary password
     * 
     * @param toEmail Pickup person's email address
     * @param userName Pickup person's name
     * @param temporaryPassword Temporary password for first login
     */
    public void sendPickupPersonRegistrationEmail(String toEmail, String userName, String temporaryPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🚚 Welcome to Smart e-Waste - Pickup Person Account Created!");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0;text-align:center}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}.credentials-box{background:#f8f9fa;border-left:4px solid #667eea;padding:20px;margin:20px 0;font-family:monospace}.security-note{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>🚚</div>" +
                "<h1>Smart e-Waste Portal</h1>" +
                "<p style='color:#fff;margin:10px 0'>Pickup Person Account</p>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#667eea'>Welcome %s! 👋</h2>" +
                "<p>Your <strong>Pickup Person</strong> account has been successfully created in the <strong>Smart e-Waste Collection & Management System</strong>!</p>" +
                "<p>You can now login to the system and start managing e-waste pickup requests in your area.</p>" +
                "<div class='credentials-box'>" +
                "<strong>📧 Your Login Credentials:</strong><br><br>" +
                "<strong>Email:</strong> %s<br>" +
                "<strong>Temporary Password:</strong> %s" +
                "</div>" +
                "<div class='security-note'>" +
                "<strong>🔒 Security Notice:</strong><br>" +
                "This is a temporary password. For your security, please change your password after your first login." +
                "</div>" +
                "<div style='background:#e7f3ff;border-left:4px solid #667eea;padding:15px;margin:20px 0'>" +
                "<strong>✨ Your Responsibilities:</strong><br>" +
                "• Review assigned pickup requests promptly<br>" +
                "• Contact users to confirm pickup times<br>" +
                "• Update request status after completion<br>" +
                "• Handle e-waste professionally and safely<br>" +
                "• Maintain communication with admin team" +
                "</div>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you have any questions, please contact the admin team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "<p style='margin-top:15px'>This is an automated message. Please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName, toEmail, temporaryPassword
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup person registration email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup person registration email: " + e.getMessage());
            throw new RuntimeException("Failed to send pickup person registration email. Please try again later.");
        }
    }

    /**
     * Send pickup request approval email
     * 
     * @param toEmail User's email address
     * @param userName User's name
     * @param requestId Pickup request ID
     * @param deviceType Device type
     */
    public void sendPickupApprovalEmail(String toEmail, String userName, String requestId, String deviceType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Smart e-Waste - Pickup Request Accepted");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#3b82f6 0%%,#1d4ed8 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#3b82f6 0%%,#1d4ed8 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0}.info-box{background:#eff6ff;border-left:4px solid #3b82f6;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>🎉</div>" +
                "<h1>Request Accepted!</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#3b82f6'>Great News, %s! ✅</h2>" +
                "<p>Your e-waste pickup request has been <strong>accepted</strong> by our team and is now <strong>in progress</strong>.</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Request Details:</strong><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Status:</strong> <span style='color:#3b82f6'>IN PROGRESS</span>" +
                "</div>" +
                "<p><strong>What's Next?</strong></p>" +
                "<ul>" +
                "<li>Our team is processing your request</li>" +
                "<li>You'll be contacted soon for pickup scheduling</li>" +
                "<li>A pickup person will be assigned to collect your e-waste</li>" +
                "</ul>" +
                "<p style='text-align:center;color:#10b981;font-weight:bold;margin-top:30px'>Thank you for contributing to a cleaner environment! 🌱</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName,
                requestId,
                deviceType
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup approval email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup approval email: " + e.getMessage());
        }
    }

    /**
     * Send pickup request rejection email
     * 
     * @param toEmail User's email address
     * @param userName User's name
     * @param deviceType Device type
     * @param reason Rejection reason
     */
    public void sendPickupRejectionEmail(String toEmail, String userName, String deviceType, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("ℹ️ Smart e-Waste - Pickup Request Update");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#f59e0b 0%%,#d97706 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#3b82f6 0%%,#1d4ed8 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0}.info-box{background:#fef3c7;border-left:4px solid:#f59e0b;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>ℹ️</div>" +
                "<h1>Request Update</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#f59e0b'>Hello %s,</h2>" +
                "<p>We regret to inform you that your e-waste pickup request for <strong>%s</strong> could not be accepted at this time.</p>" +
                "<div class='info-box'>" +
                "<strong>📝 Reason:</strong><br>" +
                "%s" +
                "</div>" +
                "<p><strong>What You Can Do:</strong></p>" +
                "<ul>" +
                "<li>Review the reason above</li>" +
                "<li>Submit a new request with updated information</li>" +
                "<li>Contact our support team for assistance</li>" +
                "</ul>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you have any questions, please don't hesitate to reach out to our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 We're here to help you dispose of e-waste responsibly!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName,
                deviceType,
                reason
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup rejection email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup rejection email: " + e.getMessage());
        }
    }

    /**
     * Send pickup request status update email
     * 
     * @param toEmail User's email address
     * @param userName User's name
     * @param requestId Pickup request ID
     * @param deviceType Device type
     * @param status New status
     */
    public void sendPickupStatusUpdateEmail(String toEmail, String userName, String requestId, String deviceType, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📊 Smart e-Waste - Pickup Request Status Update");
            
            String statusMessage;
            String statusColor;
            String statusIcon;
            if (status.equals("IN_PROGRESS")) {
                statusMessage = "Your pickup request is now in progress. Our team is working on scheduling your pickup.";
                statusColor = "#3b82f6";
                statusIcon = "🔄";
            } else if (status.equals("RESOLVED")) {
                statusMessage = "Your pickup request has been completed successfully. Thank you for your contribution!";
                statusColor = "#10b981";
                statusIcon = "✅";
            } else {
                statusMessage = "Your pickup request status has been updated to: " + status;
                statusColor = "#6366f1";
                statusIcon = "📋";
            }
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,%s 0%%,#4f46e5 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#3b82f6 0%%,#1d4ed8 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0}.info-box{background:#eff6ff;border-left:4px solid:%s;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>%s</div>" +
                "<h1>Status Update</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:%s'>Hello %s! 👋</h2>" +
                "<p>%s</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Request Details:</strong><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Status:</strong> <span style='color:%s;font-weight:bold'>%s</span>" +
                "</div>" +
                "<p style='margin-top:20px'>You can check your request details by logging into the Smart e-Waste portal.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                statusColor,
                statusColor,
                statusIcon,
                statusColor,
                userName,
                statusMessage,
                requestId,
                deviceType,
                statusColor,
                status
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup status update email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup status update email: " + e.getMessage());
        }
    }

    /**
     * Send email notification when admin changes pickup date
     * 
     * @param toEmail User's email
     * @param userName User's name
     * @param requestId Request ID
     * @param deviceType Device type
     * @param oldDate Original pickup date (not used in email)
     * @param newDate New pickup date
     * @param reason Reason for date change
     */
    public void sendPickupDateChangeEmail(String toEmail, String userName, String requestId, 
                                          String deviceType, java.time.LocalDateTime oldDate, 
                                          java.time.LocalDateTime newDate, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Smart e-Waste - Pickup Schedule Updated");
            
            // Format new date
            String newDateFormatted = newDate.toLocalDate().toString() + " at " + 
                newDate.toLocalTime().toString().substring(0, 5);
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#8b5cf6 0%%,#6d28d9 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#8b5cf6 0%%,#6d28d9 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0}.info-box{background:#f5f3ff;border-left:4px solid:#8b5cf6;padding:15px;margin:20px 0}.schedule-box{background:#ede9fe;border:2px solid #8b5cf6;border-radius:8px;padding:20px;margin:20px 0;text-align:center}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +

                "<h1>Pickup Schedule Updated</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#8b5cf6'>Dear %s,</h2>" +
                "<p>Your e-waste pickup schedule has been updated by our admin team.</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Request Information:</strong><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s" +
                "</div>" +
                "<div class='schedule-box'>" +
                "<div style='font-size:40px;margin-bottom:10px'>🗓️</div>" +
                "<strong style='font-size:18px;color:#6d28d9'>New Pickup Date & Time</strong><br>" +
                "<div style='font-size:24px;color:#8b5cf6;font-weight:bold;margin-top:10px'>%s</div>" +
                "</div>" +
                "<div class='info-box'>" +
                "<strong>💬 Reason for Schedule Change:</strong><br>" +
                "%s" +
                "</div>" +
                "<div style='background:#fef3c7;border-left:4px solid:#f59e0b;padding:15px;margin:20px 0'>" +
                "<strong>📌 Important Reminders:</strong><br>" +
                "✓ Please be available at the pickup address on the scheduled date<br>" +
                "✓ Keep your e-waste items ready for collection<br>" +
                "✓ Ensure someone is present to hand over the items" +
                "</div>" +
                "<p style='font-size:14px;color:#6c757d;text-align:center;margin-top:30px'>If you have any questions or concerns about this change, please contact our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "<p style='margin-top:15px;font-size:11px'>This is an automated message. Please do not reply to this email.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName,
                requestId,
                deviceType,
                newDateFormatted,
                reason != null && !reason.isEmpty() ? reason : "Administrative scheduling adjustment"
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup date change email sent successfully to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup date change email: " + e.getMessage());
        }
    }
    
    /**
     * Send email to pickup person when assigned to a request
     */
    public void sendPickupAssignmentEmail(String pickupPersonEmail, String pickupPersonName, 
                                         String requestId, String userName, String pickupAddress, 
                                         String pickupDate, String deviceType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(pickupPersonEmail);
            helper.setSubject("🚚 New Pickup Request Assigned - Smart e-Waste");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#e7f3ff;border-left:4px solid #667eea;padding:15px;margin:20px 0}.btn{display:inline-block;padding:15px 35px;background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);color:#fff!important;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>🚚</div>" +
                "<h1>New Pickup Request Assigned</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#667eea'>Hello %s! 👋</h2>" +
                "<p>A new e-waste pickup request has been assigned to you.</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Pickup Details:</strong><br><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Customer Name:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Pickup Address:</strong> %s<br>" +
                "<strong>Scheduled Date:</strong> %s" +
                "</div>" +
                "<p>Please log in to your dashboard to view full details and manage this pickup.</p>" +
                "<a href='%s' class='btn'>View Pickup Details</a>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>Thank you for your service!</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                pickupPersonName, requestId, userName, deviceType, pickupAddress, pickupDate, appUrl
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup assignment email sent to: " + pickupPersonEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup assignment email: " + e.getMessage());
        }
    }
    
    /**
     * Send email to user when pickup is postponed
     */
    public void sendPickupPostponedEmail(String userEmail, String userName, String requestId, 
                                        String reason, String newPickupDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("📅 Pickup Date Rescheduled - Smart e-Waste");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>📅</div>" +
                "<h1>Pickup Date Rescheduled</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#667eea'>Hello %s! 👋</h2>" +
                "<p>We regret to inform you that your e-waste pickup (Request ID: %s) has been rescheduled.</p>" +
                "<div class='info-box'>" +
                "<strong>⚠️ Reason for Rescheduling:</strong><br>" +
                "%s<br><br>" +
                "<strong>🗓️ New Pickup Date:</strong> %s" +
                "</div>" +
                "<p>We apologize for any inconvenience caused. Our team will be there on the new date to collect your e-waste.</p>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you have any questions, please contact our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName, requestId, reason, newPickupDate
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup postponed email sent to: " + userEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup postponed email: " + e.getMessage());
        }
    }
    
    /**
     * Send email to user when request is assigned to pickup person
     */
    public void sendUserPickupAssignmentEmail(String userEmail, String userName, String requestId,
                                             String pickupPersonName, String pickupPersonPhone,
                                             String pickupDate, String deviceType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("✅ Pickup Person Assigned - Smart e-Waste");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#10b981 0%%,#059669 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#d1fae5;border-left:4px solid #10b981;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>✅</div>" +
                "<h1>Pickup Person Assigned</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#10b981'>Hello %s! 👋</h2>" +
                "<p>Great news! Your e-waste pickup request (ID: %s) has been assigned to a pickup person.</p>" +
                "<div class='info-box'>" +
                "<strong>👤 Pickup Person Details:</strong><br><br>" +
                "<strong>Name:</strong> %s<br>" +
                "<strong>Phone:</strong> %s<br><br>" +
                "<strong>📦 Pickup Details:</strong><br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Scheduled Date:</strong> %s" +
                "</div>" +
                "<p>The pickup person will contact you soon to confirm the pickup. Please keep your e-waste ready for collection.</p>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you have any questions, feel free to contact the pickup person directly.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName, requestId, pickupPersonName, pickupPersonPhone, deviceType, pickupDate
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("User pickup assignment email sent to: " + userEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send user pickup assignment email: " + e.getMessage());
        }
    }
    
    /**
     * Send email to user when request is resolved/completed
     */
    public void sendRequestResolvedEmail(String userEmail, String userName, String requestId,
                                        String deviceType, String pickupPersonName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("🎉 Request Completed - Smart e-Waste");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#e7f3ff;border-left:4px solid #667eea;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>🎉</div>" +
                "<h1>Request Resolved Successfully</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#667eea'>Hello %s! 👋</h2>" +
                "<p>Congratulations! Your e-waste pickup request has been successfully completed and resolved.</p>" +
                "<div class='info-box'>" +
                "<strong>✅ Request Summary:</strong><br><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Collected By:</strong> %s<br>" +
                "<strong>Status:</strong> <span style='color:#10b981;font-weight:bold'>COMPLETED</span>" +
                "</div>" +
                "<p>Thank you for contributing to e-waste management and making our environment cleaner!</p>" +
                "<div style='background:#d1fae5;border-left:4px solid #10b981;padding:15px;margin:20px 0'>" +
                "<strong>🌱 Your Impact:</strong><br>" +
                "By properly disposing of your e-waste, you've helped:<br>" +
                "• Prevent toxic materials from entering landfills<br>" +
                "• Enable recycling of valuable materials<br>" +
                "• Reduce environmental pollution<br>" +
                "• Support a sustainable future" +
                "</div>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>We look forward to serving you again!</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Making the world greener, one device at a time!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName, requestId, deviceType, pickupPersonName
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Request resolved email sent to: " + userEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send request resolved email: " + e.getMessage());
        }
    }

    /**
     * Send pickup review rejection email to pickup person
     */
    public void sendPickupReviewRejectedToPickupPerson(String pickupPersonEmail, String pickupPersonName, 
                                                       String requestId, String deviceType, 
                                                       String reviewNotes, String userAddress) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(pickupPersonEmail);
            helper.setSubject("❌ Pickup Review Not Approved - Action Required");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#ef4444 0%%,#dc2626 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#fef2f2;border-left:4px solid #ef4444;padding:15px;margin:20px 0}.action-box{background:#fff7ed;border-left:4px solid #fb923c;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>❌</div>" +
                "<h1>Pickup Review Not Approved</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#ef4444'>Hello %s,</h2>" +
                "<p>The admin has reviewed your completed pickup submission and has <strong>not approved</strong> it.</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Request Details:</strong><br><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Address:</strong> %s" +
                "</div>" +
                "<div class='action-box'>" +
                "<strong>👤 Admin Review Notes:</strong><br><br>" +
                "%s" +
                "</div>" +
                "<div style='background:#e0f2fe;border-left:4px solid #3b82f6;padding:15px;margin:20px 0'>" +
                "<strong>⚡ Next Steps:</strong><br><br>" +
                "• Review the admin's feedback above<br>" +
                "• The request has been reset to <strong>IN_PROGRESS</strong> status<br>" +
                "• You can now reschedule and attempt the pickup again<br>" +
                "• Check your dashboard to view and manage this request<br>" +
                "• If you cannot complete the pickup, mark it as 'Not Completed' with a new date" +
                "</div>" +
                "<p style='margin-top:25px'>Please review the notes carefully and take appropriate action.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🚚 Quality pickups for a cleaner environment</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                pickupPersonName, requestId, deviceType, userAddress, reviewNotes
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup review rejection email sent to pickup person: " + pickupPersonEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup review rejection email: " + e.getMessage());
        }
    }

    /**
     * Send pickup review rejection email to user
     */
    public void sendPickupReviewRejectedToUser(String userEmail, String userName, 
                                               String requestId, String deviceType, 
                                               String pickupPersonName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("⏳ Pickup Rescheduling - Smart e-Waste");
            
            String emailBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#fb923c 0%%,#f97316 100%%);padding:30px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:30px}.info-box{background:#fff7ed;border-left:4px solid #fb923c;padding:15px;margin:20px 0}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#6c757d}</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<div style='font-size:60px'>⏳</div>" +
                "<h1>Pickup Being Rescheduled</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2 style='color:#fb923c'>Hello %s! 👋</h2>" +
                "<p>We wanted to inform you that your e-waste pickup is being rescheduled by our team for quality assurance purposes.</p>" +
                "<div class='info-box'>" +
                "<strong>📋 Request Details:</strong><br><br>" +
                "<strong>Request ID:</strong> %s<br>" +
                "<strong>Device Type:</strong> %s<br>" +
                "<strong>Pickup Person:</strong> %s<br>" +
                "<strong>Status:</strong> <span style='color:#fb923c;font-weight:bold'>IN PROGRESS</span>" +
                "</div>" +
                "<div style='background:#e0f2fe;border-left:4px solid #3b82f6;padding:15px;margin:20px 0'>" +
                "<strong>ℹ️ What's Happening:</strong><br><br>" +
                "• Our team is ensuring the highest quality of service<br>" +
                "• The pickup person will contact you to reschedule<br>" +
                "• You may receive a new pickup date and time soon<br>" +
                "• No action is required from your end" +
                "</div>" +
                "<p>We apologize for any inconvenience and appreciate your patience as we work to provide you with the best service.</p>" +
                "<p style='font-size:14px;color:#6c757d;margin-top:30px'>If you have any questions, feel free to contact us.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p><strong>Smart e-Waste Team</strong></p>" +
                "<p>🌱 Committed to excellence in e-waste management</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                userName, requestId, deviceType, pickupPersonName
            );
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            
            System.out.println("Pickup rescheduling email sent to user: " + userEmail);
            
        } catch (MessagingException e) {
            System.err.println("Failed to send pickup rescheduling email to user: " + e.getMessage());
        }
    }
}
