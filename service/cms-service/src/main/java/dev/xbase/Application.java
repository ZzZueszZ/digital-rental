package dev.xbase;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application implements CommandLineRunner {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) {
//        PrepareEmail prepareEmail = PrepareEmail.builder()
//                .from(new Address("vunt", "nguyenthachvu.vn@gmail.com"))
//                .tos(new Addresses(List.of(new Address("nguyenthachvu.vn@gmail.com", "nguyenthachvu.vn@gmail.com"))))
//                .subject(new EmailSubject(applicationContext.getId()))
//                .type(EmailBodyType.Text)
//                .body(new EmailBody("test"))
//                .ccs(Addresses.ofEmpty())
//                .bccs(Addresses.ofEmpty())
//                .attachments(EmailAttachments.ofEmpty())
//                .metaData(MetaData.ofEmpty())
//                .build();
//
//        emailService.send(prepareEmail);
    }
}
