/**
 * StatCard 컴포넌트
 *
 * 대시보드 통계 표시용 카드
 * 아이콘, 제목, 값, 변화율 등을 표시
 *
 * @param {ReactNode} icon - 아이콘 컴포넌트
 * @param {string} title - 통계 제목
 * @param {string|number} value - 통계 값
 * @param {string} change - 변화율 (예: "+5.2%")
 * @param {string} changeType - 변화 타입 (positive, negative, neutral)
 */

const StatCard = ({ icon, title, value, change, changeType = 'neutral' }) => {
  // 변화 타입별 색상
  const changeColors = {
    positive: 'text-primary-green',
    negative: 'text-red-500',
    neutral: 'text-text-secondary',
  };

  return (
    <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
          <p className="text-text-primary text-3xl font-bold mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-primary-green to-primary-purple rounded-lg">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
