package org.web.rentals.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;

@Getter
@Setter
public class CompleteRentalRequest {
    private PaymentMethod refundMethod;
    private String note;
}
