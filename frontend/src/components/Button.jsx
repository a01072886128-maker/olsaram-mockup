/**
 * Button 컴포넌트
 *
 * 재사용 가능한 버튼 컴포넌트
 * variant에 따라 다른 스타일 적용
 *
 * @param {string} variant - 버튼 스타일 (primary, secondary, outline)
 * @param {string} size - 버튼 크기 (sm, md, lg)
 * @param {function} onClick - 클릭 이벤트 핸들러
 * @param {ReactNode} children - 버튼 내용
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  ...props
}) => {
  // variant별 스타일 정의
  const variantStyles = {
    primary: 'bg-primary-green hover:bg-dark-green text-white',
    secondary: 'bg-primary-purple hover:bg-dark-purple text-white',
    outline: 'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white',
  };

  // size별 스타일 정의
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-lg font-semibold
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
