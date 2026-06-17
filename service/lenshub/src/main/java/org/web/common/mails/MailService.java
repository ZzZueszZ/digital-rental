package org.web.common.mails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.web.orders.model.Order;
import org.web.orders.model.OrderItem;
import org.web.rentals.model.RentalOrder;
import org.web.rentals.model.RentalOrderItem;
import org.web.support.model.SupportTicket;
import org.web.users.model.User;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

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

    public void sendContractSigningOtp(User user, String otpCode, String orderCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Mã OTP ký hợp đồng điện tử Lenshub - Đơn hàng #" + orderCode);
        message.setText("Xin chào,\n\n"
                + "Bạn đang thực hiện ký hợp đồng điện tử cho đơn thuê thiết bị #" + orderCode + ".\n"
                + "Mã OTP của bạn là: " + otpCode + "\n"
                + "Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n"
                + "Trân trọng,\nLenshub Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send signing OTP email to: " + user.getEmail());
        }
    }

    public void sendOrderPaymentSuccessEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(order.getUser().getEmail());
        message.setSubject("Digital Rental - Thanh toán đơn mua thành công #" + order.getCode());
        message.setText(buildOrderPaymentSuccessText(order));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send order success email to: " + order.getUser().getEmail());
        }
    }

    public void sendOrderPlacedEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(order.getUser().getEmail());
        message.setSubject("Digital Rental - Đã tiếp nhận đơn hàng #" + order.getCode());
        message.setText(buildOrderPlacedText(order));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send order placed email to: " + order.getUser().getEmail());
        }
    }

    public void sendRentalPaymentSuccessEmail(RentalOrder order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(order.getUser().getEmail());
        message.setSubject("Digital Rental - Thanh toán đơn thuê thành công #" + order.getCode());
        message.setText(buildRentalPaymentSuccessText(order));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send rental success email to: " + order.getUser().getEmail());
        }
    }

    private String buildOrderPaymentSuccessText(Order order) {
        StringBuilder content = new StringBuilder();
        appendMailHeader(content, "THANH TOÁN ĐƠN HÀNG THÀNH CÔNG");
        content.append("Xin chào ").append(defaultText(order.getShippingName(), "bạn")).append(",\n\n");
        content.append("Digital Rental đã ghi nhận thanh toán thành công cho đơn hàng của bạn. Đơn hàng sẽ được kiểm tra, đóng gói và chuyển sang bước xử lý tiếp theo.\n\n");
        appendOrderSummary(content, order);
        content.append("Trạng thái thanh toán: Đã thanh toán\n");
        content.append("Ghi chú: Nếu có thay đổi về giao nhận, Digital Rental sẽ liên hệ qua số điện thoại nhận hàng.\n\n");
        appendMailFooter(content);
        return content.toString();
    }

    private String buildOrderPlacedText(Order order) {
        StringBuilder content = new StringBuilder();
        appendMailHeader(content, "TIẾP NHẬN ĐƠN HÀNG THÀNH CÔNG");
        content.append("Xin chào ").append(defaultText(order.getShippingName(), "bạn")).append(",\n\n");
        content.append("Digital Rental đã tiếp nhận đơn hàng của bạn. Vui lòng kiểm tra lại thông tin bên dưới để bảo đảm đơn hàng được xử lý chính xác.\n\n");
        appendOrderSummary(content, order);
        content.append("Trạng thái thanh toán: ").append(paymentStatusText(order)).append("\n");
        content.append("Bước tiếp theo: Digital Rental sẽ kiểm tra tồn kho và xác nhận đơn hàng trước khi giao.\n\n");
        appendMailFooter(content);
        return content.toString();
    }

    private void appendOrderSummary(StringBuilder content, Order order) {
        content.append("THÔNG TIN ĐƠN HÀNG\n");
        content.append("- Mã đơn hàng: #").append(order.getCode()).append("\n");
        content.append("- Phương thức thanh toán: ").append(paymentMethodText(order)).append("\n");
        content.append("- Tổng thanh toán: ").append(formatMoney(order.getTotalPrice())).append("\n");
        content.append("- Giảm giá: ").append(formatMoney(order.getDiscountAmount())).append("\n");
        content.append("- Phí giao hàng: ").append(formatMoney(order.getShippingFee())).append("\n\n");

        content.append("THÔNG TIN NHẬN HÀNG\n");
        content.append("- Người nhận: ").append(defaultText(order.getShippingName(), "Chưa cập nhật")).append("\n");
        content.append("- Số điện thoại: ").append(defaultText(order.getShippingPhone(), "Chưa cập nhật")).append("\n");
        content.append("- Địa chỉ: ").append(defaultText(order.getShippingAddress(), "Chưa cập nhật")).append("\n\n");

        content.append("CHI TIẾT SẢN PHẨM\n");
        for (OrderItem item : order.getItems()) {
            content.append("- ")
                    .append(item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm")
                    .append(" x").append(item.getQuantity())
                    .append(" | Đơn giá: ").append(formatMoney(item.getUnitPrice()))
                    .append(" | Thành tiền: ").append(formatMoney(item.getSubtotal()))
                    .append("\n");
        }
        content.append("\n");
    }

    private String buildRentalPaymentSuccessText(RentalOrder order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        StringBuilder content = new StringBuilder();
        content.append("Xin chào ").append(defaultText(order.getShippingName(), "bạn")).append(",\n\n");
        content.append("Digital Rental đã ghi nhận thanh toán phí thuê thành công cho đơn thuê của bạn.\n\n");
        content.append("Mã đơn thuê: #").append(order.getCode()).append("\n");
        content.append("Phí thuê đã thanh toán: ").append(formatMoney(order.getRentalFee())).append("\n");
        content.append("Thời gian thuê: ")
                .append(order.getStartDate() != null ? order.getStartDate().format(formatter) : "Chưa cập nhật")
                .append(" - ")
                .append(order.getEndDate() != null ? order.getEndDate().format(formatter) : "Chưa cập nhật")
                .append("\n");
        content.append("Địa điểm nhận thiết bị: ").append(defaultText(order.getShippingAddress(), "Chưa cập nhật")).append("\n\n");
        content.append("Thiết bị thuê:\n");
        for (RentalOrderItem item : order.getItems()) {
            content.append("- ")
                    .append(item.getProduct() != null ? item.getProduct().getName() : "Thiết bị")
                    .append(" - ")
                    .append(formatMoney(item.getPricePerDay()))
                    .append("/ngày\n");
        }
        content.append("\nBước tiếp theo: vui lòng kiểm tra hợp đồng điện tử, hoàn tất ký hợp đồng và tiền cọc theo hướng dẫn trước khi nhận thiết bị.\n\n");
        content.append("Trân trọng,\nDigital Rental");
        return content.toString();
    }

    private void appendMailHeader(StringBuilder content, String title) {
        content.append("========================================\n");
        content.append("DIGITAL RENTAL\n");
        content.append(title).append("\n");
        content.append("========================================\n\n");
    }

    private void appendMailFooter(StringBuilder content) {
        content.append("Cảm ơn bạn đã tin tưởng Digital Rental.\n");
        content.append("Hotline hỗ trợ: 0909 123 456\n");
        content.append("Email hỗ trợ: support@studiovisuals.vn\n\n");
        content.append("Trân trọng,\nDigital Rental");
    }

    private String paymentMethodText(Order order) {
        if (order.getPaymentMethod() == null) {
            return "Chưa cập nhật";
        }
        return switch (order.getPaymentMethod()) {
            case ONLINE -> "VNPay Online";
            case COD -> "Thanh toán khi nhận hàng";
            case CASH -> "Tiền mặt";
            case BANK_TRANSFER -> "Chuyển khoản ngân hàng";
            case POS -> "Thanh toán POS tại cửa hàng";
        };
    }

    private String paymentStatusText(Order order) {
        if (order.getPaymentStatus() == null) {
            return "Chưa cập nhật";
        }
        return switch (order.getPaymentStatus()) {
            case SUCCESS -> "Đã thanh toán";
            case PENDING -> "Chờ thanh toán";
            case FAILED -> "Thanh toán thất bại";
        };
    }

    private String formatMoney(BigDecimal amount) {
        BigDecimal safeAmount = amount != null ? amount : BigDecimal.ZERO;
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
        formatter.setMaximumFractionDigits(0);
        return formatter.format(safeAmount) + " đ";
    }

    private String defaultText(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
