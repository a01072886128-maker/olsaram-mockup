package com.olsaram.backend.dto.reservation;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CancelFeeUpdateRequest {
    private Double finalCancelFee;
}
