package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.dto.reservation.OwnerReservationResponse;
import com.olsaram.backend.dto.reservation.ReservationStatusUpdateRequest;
import com.olsaram.backend.repository.BusinessRepository;
import com.olsaram.backend.repository.CustomerRepository;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;

    public Reservation createReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getReservationsByMemberId(Long memberId) {
        return reservationRepository.findByMemberId(memberId);
    }

    public List<OwnerReservationResponse> getReservationsByOwnerId(Long ownerId) {
        List<Business> businesses = businessRepository.findByOwner_OwnerId(ownerId);
        if (businesses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> businessIds = businesses.stream()
            .map(Business::getBusinessId)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        if (businessIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Reservation> reservations = reservationRepository.findByBusinessIdIn(businessIds);
        Map<Long, Business> businessMap = businesses.stream()
            .collect(Collectors.toMap(Business::getBusinessId, business -> business, (a, b) -> a));

        Map<Long, String> customerNameMap = customerRepository.findAllById(
            reservations.stream()
                .map(Reservation::getMemberId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet())
        ).stream()
        .collect(Collectors.toMap(Customer::getCustomerId, Customer::getName, (a, b) -> a));

        return reservations.stream()
            .map(reservation -> OwnerReservationResponse.builder()
                .id(reservation.getId())
                .businessId(reservation.getBusinessId())
                .businessName(businessMap.containsKey(reservation.getBusinessId())
                    ? businessMap.get(reservation.getBusinessId()).getBusinessName()
                    : null)
                .businessAddress(businessMap.containsKey(reservation.getBusinessId())
                    ? businessMap.get(reservation.getBusinessId()).getAddress()
                    : null)
                .memberId(reservation.getMemberId())
                .customerName(customerNameMap.get(reservation.getMemberId()))
                .reservationTime(reservation.getReservationTime())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .build())
            .collect(Collectors.toList());
    }

    public Reservation updateReservationStatus(Long reservationId, ReservationStatusUpdateRequest request) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (StringUtils.hasText(request.getStatus())) {
            reservation.setStatus(request.getStatus());
        }

        if (StringUtils.hasText(request.getPaymentStatus())) {
            reservation.setPaymentStatus(request.getPaymentStatus());
        }

        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}
