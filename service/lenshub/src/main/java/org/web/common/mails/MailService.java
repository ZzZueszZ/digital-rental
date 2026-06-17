package org.web.common.mails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    private static final String SUPPORT_PHONE = "037 6600 545";
    private static final String SUPPORT_EMAIL = "adminlenshub@gmail.com";

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@zyna.dev}")
    private String fromEmail;

    @Value("${app.public-base-url:http://localhost:8080}")
    private String publicBaseUrl;

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

        sendHtmlEmail(
                order.getUser().getEmail(),
                "Digital Rental - Thanh toán đơn mua thành công #" + order.getCode(),
                buildOrderPaymentSuccessHtml(order)
        );
    }

    public void sendOrderPlacedEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        sendHtmlEmail(
                order.getUser().getEmail(),
                "Digital Rental - Đã tiếp nhận đơn hàng #" + order.getCode(),
                buildOrderPlacedHtml(order)
        );
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

    private String buildOrderPaymentSuccessHtml(Order order) {
        return buildOrderHtml(
                order,
                "Thanh toán đơn hàng thành công",
                "Digital Rental đã ghi nhận thanh toán thành công cho đơn hàng của bạn. Đơn hàng sẽ được kiểm tra, đóng gói và chuyển sang bước xử lý tiếp theo.",
                "Đã thanh toán",
                "Nếu có thay đổi về giao nhận, Digital Rental sẽ liên hệ qua số điện thoại nhận hàng."
        );
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

    private String buildOrderPlacedHtml(Order order) {
        return buildOrderHtml(
                order,
                "Tiếp nhận đơn hàng thành công",
                "Digital Rental đã tiếp nhận đơn hàng của bạn. Vui lòng kiểm tra lại thông tin bên dưới để bảo đảm đơn hàng được xử lý chính xác.",
                paymentStatusText(order),
                "Digital Rental sẽ kiểm tra đơn hàng và xác nhận đơn hàng trước khi giao."
        );
    }

    private String buildOrderHtml(Order order, String title, String intro, String paymentStatus, String nextStep) {
        StringBuilder rows = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            String productName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
            String imageUrl = item.getProduct() != null ? resolveImageUrl(item.getProduct().getMainImageUrl()) : "";
            rows.append("<tr>")
                    .append("<td style=\"padding:14px 0;border-bottom:1px solid #f1f1f1;width:74px;\">")
                    .append(imageUrl.isBlank()
                            ? "<div style=\"width:58px;height:58px;border-radius:14px;background:#f4f4f5;border:1px solid #e4e4e7;\"></div>"
                            : "<img src=\"" + escapeHtml(imageUrl) + "\" alt=\"" + escapeHtml(productName) + "\" style=\"width:58px;height:58px;object-fit:contain;border-radius:14px;border:1px solid #e4e4e7;background:#fff;display:block;\"/>")
                    .append("</td>")
                    .append("<td style=\"padding:14px 12px;border-bottom:1px solid #f1f1f1;\">")
                    .append("<div style=\"font-weight:700;color:#09090b;font-size:14px;line-height:1.4;\">").append(escapeHtml(productName)).append("</div>")
                    .append("<div style=\"margin-top:5px;color:#71717a;font-size:12px;\">Số lượng: ").append(item.getQuantity()).append("</div>")
                    .append("</td>")
                    .append("<td style=\"padding:14px 0;border-bottom:1px solid #f1f1f1;text-align:right;white-space:nowrap;\">")
                    .append("<div style=\"color:#71717a;font-size:12px;\">").append(formatMoney(item.getUnitPrice())).append("</div>")
                    .append("<div style=\"margin-top:5px;font-weight:800;color:#09090b;font-size:14px;\">").append(formatMoney(item.getSubtotal())).append("</div>")
                    .append("</td>")
                    .append("</tr>");
        }

        return "<!doctype html>"
                + "<html><body style=\"margin:0;padding:0;background:#f6f6f7;font-family:Arial,Helvetica,sans-serif;color:#18181b;\">"
                + "<div style=\"max-width:720px;margin:0 auto;padding:32px 16px;\">"
                + "<div style=\"background:#fff;border:1px solid #e4e4e7;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(24,24,27,.08);\">"
                + "<div style=\"padding:28px 32px;background:linear-gradient(135deg,#09090b,#2b0308);color:#fff;\">"
                + "<div style=\"font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#fecaca;font-weight:700;\">Digital Rental</div>"
                + "<h1 style=\"margin:10px 0 0;font-size:26px;line-height:1.25;\">"
                + escapeHtml(title)
                + "</h1>"
                + "<p style=\"margin:12px 0 0;color:#f4f4f5;font-size:14px;line-height:1.7;\">"
                + escapeHtml(intro)
                + "</p>"
                + "</div>"
                + "<div style=\"padding:28px 32px;\">"
                + "<div style=\"display:inline-block;padding:8px 12px;border-radius:999px;background:#fef2f2;color:#dc2626;font-weight:700;font-size:12px;margin-bottom:18px;\">Mã đơn hàng #"
                + escapeHtml(order.getCode())
                + "</div>"
                + "<table style=\"width:100%;border-collapse:collapse;margin-bottom:22px;\">"
                + infoRow("Phương thức thanh toán", paymentMethodText(order))
                + infoRow("Trạng thái thanh toán", paymentStatus)
                + infoRow("Người nhận", defaultText(order.getShippingName(), "Chưa cập nhật"))
                + infoRow("Số điện thoại", defaultText(order.getShippingPhone(), "Chưa cập nhật"))
                + infoRow("Địa chỉ nhận hàng", defaultText(order.getShippingAddress(), "Chưa cập nhật"))
                + "</table>"
                + "<div style=\"border:1px solid #eeeeef;border-radius:18px;padding:18px 20px;margin-bottom:22px;background:#fafafa;\">"
                + "<div style=\"font-weight:800;color:#09090b;margin-bottom:8px;\">Tóm tắt thanh toán</div>"
                + "<table style=\"width:100%;border-collapse:collapse;\">"
                + totalRow("Giảm giá", formatMoney(order.getDiscountAmount()), false)
                + totalRow("Phí giao hàng", formatMoney(order.getShippingFee()), false)
                + totalRow("Tổng thanh toán", formatMoney(order.getTotalPrice()), true)
                + "</table>"
                + "</div>"
                + "<div style=\"font-weight:800;color:#09090b;margin-bottom:8px;\">Chi tiết sản phẩm</div>"
                + "<table style=\"width:100%;border-collapse:collapse;\">"
                + rows
                + "</table>"
                + "<div style=\"margin-top:24px;padding:16px 18px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-size:13px;line-height:1.7;\">"
                + "<strong style=\"color:#0f172a;\">Bước tiếp theo:</strong> "
                + escapeHtml(nextStep)
                + "</div>"
                + "</div>"
                + "<div style=\"padding:20px 32px;border-top:1px solid #f1f1f1;background:#fafafa;color:#71717a;font-size:13px;line-height:1.7;\">"
                + "<div>Cảm ơn bạn đã tin tưởng Digital Rental.</div>"
                + "<div>Hotline hỗ trợ: <strong style=\"color:#18181b;\">" + SUPPORT_PHONE + "</strong></div>"
                + "<div>Email hỗ trợ: <strong style=\"color:#18181b;\">" + SUPPORT_EMAIL + "</strong></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "</body></html>";
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
        content.append("Hotline hỗ trợ: ").append(SUPPORT_PHONE).append("\n");
        content.append("Email hỗ trợ: ").append(SUPPORT_EMAIL).append("\n\n");
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

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to send HTML email to: " + to);
        }
    }

    private String resolveImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return "";
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        String baseUrl = publicBaseUrl != null ? publicBaseUrl.stripTrailing() : "";
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return imageUrl.startsWith("/") ? baseUrl + imageUrl : baseUrl + "/" + imageUrl;
    }

    private String infoRow(String label, String value) {
        return "<tr>"
                + "<td style=\"padding:8px 0;color:#71717a;font-size:13px;width:180px;vertical-align:top;\">"
                + escapeHtml(label)
                + "</td>"
                + "<td style=\"padding:8px 0;color:#18181b;font-size:13px;font-weight:700;line-height:1.5;\">"
                + escapeHtml(value)
                + "</td>"
                + "</tr>";
    }

    private String totalRow(String label, String value, boolean strong) {
        String valueStyle = strong
                ? "font-size:20px;font-weight:900;color:#dc2626;"
                : "font-size:14px;font-weight:700;color:#18181b;";
        String rowBorder = strong ? "border-top:1px solid #e4e4e7;" : "";
        String labelPadding = strong ? "padding:13px 0 7px;" : "padding:7px 0;";
        String valuePadding = strong ? "padding:13px 0 7px;" : "padding:7px 0;";
        return "<tr>"
                + "<td style=\"" + rowBorder + labelPadding + "color:#71717a;font-size:13px;text-align:left;\">"
                + escapeHtml(label)
                + "</td>"
                + "<td style=\"" + rowBorder + valuePadding + valueStyle + "text-align:right;white-space:nowrap;\">"
                + escapeHtml(value)
                + "</td>"
                + "</tr>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
