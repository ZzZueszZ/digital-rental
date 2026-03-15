package org.web.common.mails;

import org.springframework.stereotype.Service;
import org.web.users.model.User;

@Service
public class MailService {

    public void sendActivationEmail(User user, String activationLink) {
        System.out.println("==================================================");
        System.out.println("MOCK MAIL SERVER");
        System.out.println("To: " + user.getEmail());
        System.out.println("Subject: Activate your Lenshub Account");
        System.out.println("Link: " + activationLink);
        System.out.println("==================================================");
    }

    public void sendPasswordResetOtp(User user, String otpCode) {
        System.out.println("==================================================");
        System.out.println("MOCK MAIL SERVER");
        System.out.println("To: " + user.getEmail());
        System.out.println("Subject: Your Lenshub Password Reset OTP");
        System.out.println("OTP: " + otpCode);
        System.out.println("==================================================");
    }
}

