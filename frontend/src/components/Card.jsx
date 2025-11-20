/**
 * Card 컴포넌트
 *
 * 카드형 레이아웃을 위한 공통 컴포넌트
 * hover 효과와 그림자 포함
 *
 * @param {ReactNode} children - 카드 내용
 * @param {string} className - 추가 CSS 클래스
 * @param {boolean} hover - hover 효과 활성화 여부
 * @param {function} onClick - 클릭 이벤트 핸들러
 */

const Card = ({ children, className = "", hover = false, onClick }) => {
  return (
    <div
      onClick={onClick} // 🔥 추가됨!!
      className={`
        bg-card-bg rounded-xl border border-border-color
        shadow-sm p-6
        ${
          hover
            ? "hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            : ""
        }
        ${className}
      `}
      style={{
        cursor: onClick ? "pointer" : "default", // 클릭 가능하면 커서 변경
      }}
    >
      {children}
    </div>
  );
};

export default Card;
