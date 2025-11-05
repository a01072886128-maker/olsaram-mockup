import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

export function StatCard({ title, value, description, icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        {trend && (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              trend.positive ? 'text-[#10B981]' : 'text-[#EF4444]'
            )}
          >
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

