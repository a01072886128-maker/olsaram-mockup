package com.olsaram.backend.dto.reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationCreateRequest {
    private Long storeId;
    private Long customerId;
    private String date; // YYYY-MM-DD
    private String time; // HH:MM
    private Integer partySize;
    private List<Long> menuItems;
    private String requests;
}
