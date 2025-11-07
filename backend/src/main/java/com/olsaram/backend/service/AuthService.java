package com.olsaram.backend.service;

import com.olsaram.backend.dto.LoginRequest;
import com.olsaram.backend.dto.LoginResponse;
import com.olsaram.backend.dto.MemberDto;
import com.olsaram.backend.dto.RegisterRequest;
import com.olsaram.backend.entity.Member;
import com.olsaram.backend.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final MemberRepository memberRepository;

    public AuthService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Optional<Member> memberOpt = memberRepository.findByUserIdAndPassword(
                request.getUserId(),
                request.getPassword()
        );

        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();

            // 비활성화된 계정 체크
            if ("INACTIVE".equals(member.getStatus())) {
                return new LoginResponse(false, "비활성화된 계정입니다.", null);
            }

            MemberDto memberDto = new MemberDto(
                    member.getMemberId(),
                    member.getUserId(),
                    member.getName(),
                    member.getPhone(),
                    member.getEmail(),
                    member.getRole(),
                    member.getTrustScore(),
                    member.getNoShowCount(),
                    member.getStatus()
            );

            return new LoginResponse(true, "로그인 성공", memberDto);
        } else {
            return new LoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null);
        }
    }

    public LoginResponse register(RegisterRequest request) {
        // 이미 존재하는 userId인지 확인
        Optional<Member> existingMember = memberRepository.findByUserId(request.getUserId());
        if (existingMember.isPresent()) {
            return new LoginResponse(false, "이미 존재하는 아이디입니다.", null);
        }

        // 새로운 Member 생성
        Member member = new Member();
        member.setUserId(request.getUserId());
        member.setPassword(request.getPassword());
        member.setName(request.getName());
        member.setPhone(request.getPhone());
        member.setEmail(request.getEmail());
        member.setRole(request.getRole());
        member.setJoinDate(LocalDateTime.now());
        member.setTrustScore(100); // 기본 신뢰도 100
        member.setNoShowCount(0); // 노쇼 카운트 0
        member.setStatus("ACTIVE"); // 활성 상태
        member.setUpdatedAt(LocalDateTime.now());

        // DB에 저장
        Member savedMember = memberRepository.save(member);

        // MemberDto로 변환
        MemberDto memberDto = new MemberDto(
                savedMember.getMemberId(),
                savedMember.getUserId(),
                savedMember.getName(),
                savedMember.getPhone(),
                savedMember.getEmail(),
                savedMember.getRole(),
                savedMember.getTrustScore(),
                savedMember.getNoShowCount(),
                savedMember.getStatus()
        );

        return new LoginResponse(true, "회원가입 성공", memberDto);
    }
}
