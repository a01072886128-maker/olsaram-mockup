export function cn(...values) {
  return values
    .filter(Boolean)
    .flatMap((value) =>
      typeof value === 'string'
        ? value.split(' ')
        : Array.isArray(value)
          ? value
          : typeof value === 'object'
            ? Object.entries(value)
                .filter(([, condition]) => Boolean(condition))
                .map(([classname]) => classname)
            : []
    )
    .join(' ')
    .trim();
}

export function formatCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '₩0';
  }
  return `₩${Number(value).toLocaleString('ko-KR')}`;
}
