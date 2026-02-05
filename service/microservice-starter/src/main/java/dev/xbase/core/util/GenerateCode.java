package dev.xbase.core.util;

import java.nio.charset.StandardCharsets;
import java.util.Random;

public class GenerateCode {
    public static String getAlphaNumericString(int n) {
        byte[] array = new byte[256];
        new Random().nextBytes(array);
        String randomString
                = new String(array, StandardCharsets.UTF_8);
        StringBuilder r = new StringBuilder();
        String AlphaNumericString
                = randomString
                .replaceAll("[^A-Z0-9]", "");
        for (int k = 0; k < AlphaNumericString.length(); k++) {
            if (Character.isLetter(AlphaNumericString.charAt(k))
                    && (n > 0)
                    || Character.isDigit(AlphaNumericString.charAt(k))
                    && (n > 0)) {
                r.append(AlphaNumericString.charAt(k));
                n--;
            }
        }
        return r.toString();
    }
}
