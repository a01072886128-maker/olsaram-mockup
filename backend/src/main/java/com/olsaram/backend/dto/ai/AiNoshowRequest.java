package com.olsaram.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiNoshowRequest {

    @JsonProperty("고객ID")
    private Long customerId;

    @JsonProperty("예약시간")
    private String reservationTime;

    @JsonProperty("예약인원")
    private Integer partySize;

    @JsonProperty("결제방식")
    private String paymentMethod;

    @JsonProperty("고객_과거_노쇼_횟수")
    private Integer customerPastNoshowCount;

    @JsonProperty("고객_과거_예약_횟수")
    private Integer customerPastReservationCount;

    @JsonProperty("예약_변경_횟수")
    private Integer reservationChangeCount;

    @JsonProperty("당일_예약_여부")
    private Integer isSameDayReservation;

    @JsonProperty("오늘_예약_목록")
    private List<AiTodayReservationDto> todayReservations;
}
