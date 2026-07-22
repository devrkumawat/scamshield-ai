import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  
  // Safely grab the label. Pie charts use p.name, Bar charts often store it in p.payload
  const label = p.name || p.payload?.name || 'Value';

  return (
    <div className="glass-card px-3 py-2 text-xs rounded-lg shadow-lg border border-line z-50">
      <span className="text-white/90 font-medium">{label}: </span>
      <span className="text-muted font-mono">{p.value}</span>
    </div>
  );
}

export function RiskDistributionChart({ data = [] }) {
  // Prevent NaN if a value is somehow missing
  const total = data.reduce((a, b) => a + (b.value || 0), 0);
  
  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-display font-semibold">{total}</span>
        <span className="text-xs text-muted">total scans</span>
      </div>
    </div>
  );
}

export function ScamCategoryChart({ data = [] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ left: 10, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.06)" 
            horizontal={false} 
          />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: '#8B98AC', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            content={<ChartTooltip />} 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
          />
          <Bar 
            dataKey="count" 
            radius={[0, 6, 6, 0]} 
            fill="#57E3D5" 
            barSize={14} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}