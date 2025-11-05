const baseSuspiciousReservations = [
  {
    id: 'RSV-240305-001',
    customer: '이**',
    datetime: '2025-03-05 18:30',
    partySize: 4,
    channel: 'app',
    riskLevel: 'high',
    signals: ['선결제 요구', '동시예약', 'IP 의심'],
    status: 'under_review',
    phone: '010-1234-5678',
    score: 92,
    notes: '',
    timeline: [
      { label: '예약 생성', date: '2025-03-05 16:21', type: 'info' },
      { label: 'AI 고위험 탐지', date: '2025-03-05 16:23', type: 'warning' },
    ],
  },
  {
    id: 'RSV-240305-004',
    customer: '박**',
    datetime: '2025-03-05 19:10',
    partySize: 2,
    channel: 'web',
    riskLevel: 'medium',
    signals: ['단기내 다수 예약', '신규 계정'],
    status: 'under_review',
    phone: '010-2234-1111',
    score: 74,
    notes: '',
    timeline: [
      { label: '예약 생성', date: '2025-03-05 17:11', type: 'info' },
      { label: '과거 노쇼 1회', date: '2025-02-20', type: 'danger' },
    ],
  },
  {
    id: 'RSV-240304-002',
    customer: '김**',
    datetime: '2025-03-04 12:00',
    partySize: 6,
    channel: 'phone',
    riskLevel: 'low',
    signals: ['전화 예약'],
    status: 'allowed',
    phone: '010-4567-8910',
    score: 48,
    notes: '',
    timeline: [
      { label: '예약 생성', date: '2025-03-04 09:42', type: 'info' },
      { label: '직원 검토 후 허용', date: '2025-03-04 10:05', type: 'success' },
    ],
  },
  {
    id: 'RSV-240303-007',
    customer: '최**',
    datetime: '2025-03-03 20:30',
    partySize: 8,
    channel: 'app',
    riskLevel: 'high',
    signals: ['다수 카드 실패', '같은 단말 다수 예약'],
    status: 'blocked',
    phone: '010-9876-5432',
    score: 88,
    notes: '과거 3회 노쇼',
    timeline: [
      { label: '예약 생성', date: '2025-03-03 18:15', type: 'info' },
      { label: 'AI 고위험 탐지', date: '2025-03-03 18:17', type: 'warning' },
      { label: '자동 차단', date: '2025-03-03 18:18', type: 'danger' },
    ],
  },
];

let suspiciousReservations = [...baseSuspiciousReservations];

function filterReservations(filters = {}) {
  const { riskLevel = 'all', channel = 'all', keyword = '' } = filters;

  return suspiciousReservations.filter((item) => {
    const matchRisk = riskLevel === 'all' ? true : item.riskLevel === riskLevel;
    const matchChannel = channel === 'all' ? true : item.channel === channel;
    const matchKeyword =
      !keyword ||
      item.id.toLowerCase().includes(keyword.toLowerCase()) ||
      item.customer.includes(keyword);
    return matchRisk && matchChannel && matchKeyword;
  });
}

export async function getSuspiciousReservations(filters) {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const filtered = filterReservations(filters);
  const todayCount = filtered.filter((item) => item.datetime.startsWith('2025-03-05')).length;
  const highRiskCount = filtered.filter((item) => item.riskLevel === 'high').length;
  const blockedCount = filtered.filter((item) => item.status === 'blocked').length;
  const retryCount = filtered.filter((item) => item.signals.includes('다수 카드 실패')).length;

  return {
    data: filtered,
    stats: {
      suspiciousToday: todayCount,
      highRiskRatio: filtered.length ? Math.round((highRiskCount / filtered.length) * 100) : 0,
      blockedCount,
      retryCount,
    },
  };
}

export async function getReservationDetail(id) {
  await new Promise((resolve) => setTimeout(resolve, 320));
  const reservation = suspiciousReservations.find((item) => item.id === id);
  if (!reservation) {
    throw new Error('예약 정보를 찾을 수 없습니다.');
  }

  return {
    ...reservation,
    triggers: [
      '같은 전화번호로 3곳 이상 예약',
      '예약 후 즉시 취소 반복',
      '선결제 유도 문구 감지',
    ].slice(0, reservation.riskLevel === 'high' ? 3 : 2),
    history: [
      { date: '2025-02-12', event: '방문 완료', status: 'success' },
      { date: '2025-01-25', event: '노쇼', status: 'danger' },
      { date: '2024-12-30', event: '예약 취소', status: 'warning' },
    ],
  };
}

export async function updateDecision(id, decision, memo) {
  await new Promise((resolve) => setTimeout(resolve, 380));

  const index = suspiciousReservations.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('예약 정보를 찾을 수 없습니다.');
  }

  const statusMap = {
    block: 'blocked',
    allow: 'allowed',
    waitlist: 'waitlist',
  };

  suspiciousReservations[index] = {
    ...suspiciousReservations[index],
    status: statusMap[decision] ?? suspiciousReservations[index].status,
    notes: memo ?? suspiciousReservations[index].notes,
  };

  return suspiciousReservations[index];
}

// Zero deposit policy mocks
let zeroDepositSettings = {
  enabled: true,
  requireVerification: true,
  preventDuplicate: true,
  sameDayLimit: false,
  cancellationWindow: '24h',
  penaltyEnabled: true,
};

const settlementHistory = Array.from({ length: 24 }).map((_, index) => ({
  id: `SET-${240200 + index}`,
  orderId: `ORD-${5000 + index}`,
  reservationId: `RSV-${4000 + index}`,
  customer: ['이**', '박**', '최**', '김**'][index % 4],
  visitDate: `2025-0${Math.floor(index / 8) + 1}-1${index % 9}`,
  amount: 24000 + index * 1300,
  method: index % 3 === 0 ? '계좌이체' : index % 3 === 1 ? '카드' : '현금',
  status: index % 5 === 0 ? '보류' : '완료',
  processedAt: `2025-03-0${(index % 6) + 1} 1${index % 7}:2${index % 5}`,
}));

export async function getZeroDepositSettings() {
  await new Promise((resolve) => setTimeout(resolve, 320));
  return zeroDepositSettings;
}

export async function saveZeroDepositSettings(newSettings) {
  await new Promise((resolve) => setTimeout(resolve, 450));
  zeroDepositSettings = { ...zeroDepositSettings, ...newSettings };
  return zeroDepositSettings;
}

export async function getSettlementHistory(page = 1, pageSize = 8) {
  await new Promise((resolve) => setTimeout(resolve, 260));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: settlementHistory.slice(start, end),
    total: settlementHistory.length,
  };
}

// Menu OCR mocks
function createMockMenuItems(fileName) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return [
    {
      id: `${baseName}-1`,
      name: '짜장면',
      price: 6500,
      category: '중식',
      vatIncluded: true,
      options: '곱빼기 +1,500원',
    },
    {
      id: `${baseName}-2`,
      name: '짬뽕',
      price: 7500,
      category: '중식',
      vatIncluded: true,
      options: '매운맛 조절 가능',
    },
    {
      id: `${baseName}-3`,
      name: '탕수육 (소)',
      price: 15000,
      category: '사이드',
      vatIncluded: false,
      options: '소스 별도 제공',
    },
  ];
}

export async function runOcr(files) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  return files.map((file) => ({
    fileName: file.name,
    items: createMockMenuItems(file.name),
  }));
}

export async function saveMenuItems(items) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true, count: items.reduce((acc, file) => acc + file.items.length, 0) };
}

