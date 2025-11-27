package com.olsaram.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiTodayReservationDto {

    @JsonProperty("예약ID")
    private Long reservationId;

    @JsonProperty("예약시간")
    private String reservationTime;

    @JsonProperty("예약인원")
    private Integer partySize;

    @JsonProperty("결제방식")
    private String paymentMethod;
}
