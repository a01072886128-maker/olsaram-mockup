import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const timeRanges = [
  { label: '오늘', value: 'today' },
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
];

export function FilterBar({
  timeRange,
  onTimeRangeChange,
  riskLevel,
  onRiskLevelChange,
  channel,
  onChannelChange,
  keyword,
  onKeywordChange,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
      <Tabs value={timeRange} onValueChange={onTimeRangeChange}>
        <TabsList>
          {timeRanges.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <Select value={riskLevel} onChange={(event) => onRiskLevelChange(event.target.value)}>
          <option value="all">위험도 전체</option>
          <option value="high">고위험</option>
          <option value="medium">중간</option>
          <option value="low">낮음</option>
        </Select>
        <Select value={channel} onChange={(event) => onChannelChange(event.target.value)}>
          <option value="all">채널 전체</option>
          <option value="app">앱 예약</option>
          <option value="phone">전화</option>
          <option value="web">웹 예약</option>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="예약 ID 또는 고객 검색"
          />
          <Button variant="outline" onClick={onReset}>
            초기화
          </Button>
        </div>
      </div>
    </div>
  );
}

