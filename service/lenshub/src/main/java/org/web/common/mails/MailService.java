package org.web.common.mails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.web.support.model.SupportTicket;
import org.web.users.model.User;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@zyna.dev}")
    private String fromEmail;

    public void sendActivationEmail(User user, String activationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Activate your Lenshub Account");
        message.setText("Hi,\n\n"
                + "Please click the link below to activate your account:\n"
                + activationLink + "\n\n"
                + "Best regards,\nLenshub Team");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send activation email to: " + user.getEmail());
        }
    }

    public void sendPasswordResetOtp(User user, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Your Lenshub Password Reset OTP");
        message.setText("Hi,\n\n"
                + "Here is your OTP code to reset your password:\n"
                + otpCode + "\n\n"
                + "Best regards,\nLenshub Team");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send OTP email to: " + user.getEmail());
        }
    }

    public void sendResetPasswordEmail(User user, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Mật khẩu tài khoản Lenshub đã được đặt lại");
        message.setText("Xin chào,\n\n"
                + "Quản trị viên đã đặt lại mật khẩu cho tài khoản của bạn.\n"
                + "Mật khẩu mới của bạn là: " + newPassword + "\n\n"
                + "Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.\n\n"
                + "Trân trọng,\nLenshub Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send reset password email to: " + user.getEmail());
        }
    }

    public void sendSupportReplyEmail(SupportTicket ticket, String replyMessage) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(ticket.getEmail());
        message.setSubject("Re: [Lenshub Support] " + ticket.getSubject());
        message.setText("Xin chào " + ticket.getName() + ",\n\n"
                + "Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn và đây là phản hồi:\n\n"
                + replyMessage + "\n\n"
                + "Trân trọng,\nLenshub Support Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send support reply email to: " + ticket.getEmail());
        }
    }
}
