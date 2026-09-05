import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Sankey,
} from "recharts";

// ---------------------------------------------------------------------------
// 1. Stacked Bar Chart: Payment Attempt Outcomes by Day
// ---------------------------------------------------------------------------
export interface DailyOutcomeData {
  day: string;
  successes: number;
  declines: number;
  timeouts: number;
  errors: number;
  webhookLost: number;
}

export const defaultDailyOutcomes: DailyOutcomeData[] = [
  { day: "21 Aug", successes: 4120, declines: 320, timeouts: 140, errors: 45, webhookLost: 18 },
  { day: "22 Aug", successes: 4350, declines: 340, timeouts: 160, errors: 52, webhookLost: 22 },
  { day: "23 Aug", successes: 3980, declines: 410, timeouts: 280, errors: 80, webhookLost: 35 },
  { day: "24 Aug", successes: 4610, declines: 310, timeouts: 120, errors: 38, webhookLost: 14 },
  { day: "25 Aug", successes: 3200, declines: 480, timeouts: 390, errors: 110, webhookLost: 48 },
  { day: "26 Aug", successes: 4420, declines: 350, timeouts: 155, errors: 42, webhookLost: 16 },
  { day: "27 Aug", successes: 4790, declines: 330, timeouts: 130, errors: 35, webhookLost: 12 },
];

export function PaymentOutcomesStackedBarChart({
  data = defaultDailyOutcomes,
  height = 320,
}: {
  data?: DailyOutcomeData[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="successes" name="Success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="declines" name="Issuer Declines" stackId="a" fill="#0ea5e9" />
          <Bar dataKey="timeouts" name="Timeouts" stackId="a" fill="#f59e0b" />
          <Bar dataKey="errors" name="Gateway Errors" stackId="a" fill="#ef4444" />
          <Bar dataKey="webhookLost" name="Webhook Lost" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Pie Chart: Payment Method Market Share
// ---------------------------------------------------------------------------
export interface PaymentMethodShare {
  name: string;
  value: number;
  color: string;
}

export const defaultMethodShares: PaymentMethodShare[] = [
  { name: "UPI Intent", value: 43.5, color: "#10b981" },
  { name: "Domestic Cards", value: 27.2, color: "#2563eb" },
  { name: "UPI Collect", value: 16.1, color: "#06b6d4" },
  { name: "Netbanking", value: 9.8, color: "#f59e0b" },
  { name: "Wallets", value: 3.4, color: "#8b5cf6" },
];

export function PaymentMethodsPieChart({
  data = defaultMethodShares,
  height = 320,
}: {
  data?: PaymentMethodShare[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name} (${value}%)`}
            labelLine={{ stroke: "#64748b", strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value}% of total volume`, "Share"]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Line Chart: Hourly Transaction Latency Profile (p95 ms)
// ---------------------------------------------------------------------------
export interface HourlyLatency {
  hour: string;
  p95Latency: number;
  slaTarget: number;
}

export const defaultHourlyLatency: HourlyLatency[] = [
  { hour: "00:00", p95Latency: 2800, slaTarget: 5000 },
  { hour: "02:00", p95Latency: 2400, slaTarget: 5000 },
  { hour: "04:00", p95Latency: 2100, slaTarget: 5000 },
  { hour: "06:00", p95Latency: 3100, slaTarget: 5000 },
  { hour: "08:00", p95Latency: 4200, slaTarget: 5000 },
  { hour: "10:00", p95Latency: 5400, slaTarget: 5000 },
  { hour: "12:00", p95Latency: 6800, slaTarget: 5000 },
  { hour: "14:00", p95Latency: 5900, slaTarget: 5000 },
  { hour: "16:00", p95Latency: 7200, slaTarget: 5000 },
  { hour: "18:00", p95Latency: 8900, slaTarget: 5000 },
  { hour: "20:00", p95Latency: 7600, slaTarget: 5000 },
  { hour: "22:00", p95Latency: 4100, slaTarget: 5000 },
];

export function LatencyLineChart({
  data = defaultHourlyLatency,
  height = 320,
}: {
  data?: HourlyLatency[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="ms" />
          <Tooltip
            formatter={(val: any) => [`${val} ms`, ""]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Line
            type="monotone"
            dataKey="p95Latency"
            name="p95 End-to-End Latency"
            stroke="#f43f5e"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#f43f5e" }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="step"
            dataKey="slaTarget"
            name="SLA Threshold (5s)"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Multiple Line Chart: True Rate vs Vanity Rate vs Bank Clearance
// ---------------------------------------------------------------------------
export interface SuccessComparison {
  day: string;
  trueRate: number;
  vanityRate: number;
  bankClearance: number;
}

export const defaultSuccessComparison: SuccessComparison[] = [
  { day: "21 Aug", trueRate: 88.1, vanityRate: 94.3, bankClearance: 91.2 },
  { day: "22 Aug", trueRate: 87.4, vanityRate: 94.1, bankClearance: 90.5 },
  { day: "23 Aug", trueRate: 84.2, vanityRate: 93.8, bankClearance: 88.4 },
  { day: "24 Aug", trueRate: 86.9, vanityRate: 94.5, bankClearance: 91.8 },
  { day: "25 Aug", trueRate: 79.3, vanityRate: 92.9, bankClearance: 84.2 },
  { day: "26 Aug", trueRate: 85.8, vanityRate: 94.0, bankClearance: 89.9 },
  { day: "27 Aug", trueRate: 87.1, vanityRate: 94.6, bankClearance: 91.4 },
];

export function MultipleLineChart({
  data = defaultSuccessComparison,
  height = 320,
}: {
  data?: SuccessComparison[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis domain={[70, 100]} stroke="#888888" fontSize={11} tickLine={false} unit="%" />
          <Tooltip
            formatter={(val: any) => [`${val}%`, ""]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Line
            type="monotone"
            dataKey="trueRate"
            name="True Success Rate (All Attempts)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981" }}
          />
          <Line
            type="monotone"
            dataKey="vanityRate"
            name="Vanity Rate (Filtered)"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={{ r: 3, fill: "#94a3b8" }}
          />
          <Line
            type="monotone"
            dataKey="bankClearance"
            name="Acquiring Bank Clearance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Area Chart: Cumulative Processed Volume (₹ Lakhs)
// ---------------------------------------------------------------------------
export interface CumulativeVolume {
  day: string;
  dailyVolume: number;
  cumulativeVolume: number;
}

export const defaultCumulativeVolume: CumulativeVolume[] = [
  { day: "21 Aug", dailyVolume: 14.2, cumulativeVolume: 14.2 },
  { day: "22 Aug", dailyVolume: 16.8, cumulativeVolume: 31.0 },
  { day: "23 Aug", dailyVolume: 13.5, cumulativeVolume: 44.5 },
  { day: "24 Aug", dailyVolume: 18.2, cumulativeVolume: 62.7 },
  { day: "25 Aug", dailyVolume: 11.4, cumulativeVolume: 74.1 },
  { day: "26 Aug", dailyVolume: 17.6, cumulativeVolume: 91.7 },
  { day: "27 Aug", dailyVolume: 19.8, cumulativeVolume: 111.5 },
];

export function CumulativeVolumeAreaChart({
  data = defaultCumulativeVolume,
  height = 320,
}: {
  data?: CumulativeVolume[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="L" />
          <Tooltip
            formatter={(val: any) => [`₹${val} Lakhs`, ""]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="cumulativeVolume"
            name="Cumulative Volume"
            stroke="#2563eb"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCumulative)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Stacked Area Chart: Liquidity Allocation Over Time (₹ Thousands)
// ---------------------------------------------------------------------------
export interface LiquidityLayer {
  day: string;
  available: number;
  inTransit: number;
  rollingReserve: number;
  onHold: number;
}

export const defaultLiquidityLayers: LiquidityLayer[] = [
  { day: "21 Aug", available: 1250, inTransit: 380, rollingReserve: 95, onHold: 20 },
  { day: "22 Aug", available: 1340, inTransit: 420, rollingReserve: 102, onHold: 20 },
  { day: "23 Aug", available: 1190, inTransit: 490, rollingReserve: 108, onHold: 45 },
  { day: "24 Aug", available: 1420, inTransit: 510, rollingReserve: 114, onHold: 35 },
  { day: "25 Aug", available: 980, inTransit: 590, rollingReserve: 118, onHold: 118 },
  { day: "26 Aug", available: 1210, inTransit: 460, rollingReserve: 122, onHold: 85 },
  { day: "27 Aug", available: 1284, inTransit: 462, rollingReserve: 125, onHold: 70 },
];

export function StackedAreaChart({
  data = defaultLiquidityLayers,
  height = 320,
}: {
  data?: LiquidityLayer[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradAvailable" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradTransit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradReserve" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradHold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="k" />
          <Tooltip
            formatter={(val: any) => [`₹${val}k`, ""]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="available"
            name="Available Settlement"
            stackId="1"
            stroke="#10b981"
            fill="url(#gradAvailable)"
          />
          <Area
            type="monotone"
            dataKey="inTransit"
            name="In-Transit Payout"
            stackId="1"
            stroke="#0ea5e9"
            fill="url(#gradTransit)"
          />
          <Area
            type="monotone"
            dataKey="rollingReserve"
            name="Rolling Reserve"
            stackId="1"
            stroke="#6366f1"
            fill="url(#gradReserve)"
          />
          <Area
            type="monotone"
            dataKey="onHold"
            name="Anomaly Hold"
            stackId="1"
            stroke="#f59e0b"
            fill="url(#gradHold)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Radar Chart: Multi-Dimensional Risk & Gateway Health Profile
// ---------------------------------------------------------------------------
export interface RadarDimension {
  metric: string;
  merchantScore: number;
  industryBenchmark: number;
  fullMark: number;
}

export const defaultRadarData: RadarDimension[] = [
  { metric: "Velocity Safety", merchantScore: 92, industryBenchmark: 80, fullMark: 100 },
  { metric: "3DS Auth Rate", merchantScore: 88, industryBenchmark: 75, fullMark: 100 },
  { metric: "Webhook Health", merchantScore: 98, industryBenchmark: 85, fullMark: 100 },
  { metric: "Dispute Defense", merchantScore: 95, industryBenchmark: 70, fullMark: 100 },
  { metric: "Mandate Success", merchantScore: 91, industryBenchmark: 78, fullMark: 100 },
  { metric: "Cross-Border Auth", merchantScore: 84, industryBenchmark: 65, fullMark: 100 },
];

export function RiskRadarChart({
  data = defaultRadarData,
  height = 340,
}: {
  data?: RadarDimension[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#64748b" opacity={0.2} />
          <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" opacity={0.3} fontSize={10} />
          <Radar
            name="Merchant Score"
            dataKey="merchantScore"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.45}
          />
          <Radar
            name="Industry Benchmark"
            dataKey="industryBenchmark"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Sankey Chart: End-to-End Fund Flow Diagram
// ---------------------------------------------------------------------------
export const defaultSankeyData = {
  nodes: [
    { name: "Gross Customer Inflow" }, // 0
    { name: "Captured & Cleared" },    // 1
    { name: "Silent Timeouts" },       // 2
    { name: "Issuer Declines" },       // 3
    { name: "Merchant Settlement" },   // 4
    { name: "Rolling Reserve (2%)" },  // 5
    { name: "Gateway Clearing Fee" },  // 6
    { name: "Instant Auto-Refunds" },  // 7
  ],
  links: [
    { source: 0, target: 1, value: 84.5 },
    { source: 0, target: 2, value: 7.5 },
    { source: 0, target: 3, value: 8.0 },
    { source: 1, target: 4, value: 78.2 },
    { source: 1, target: 5, value: 3.5 },
    { source: 1, target: 6, value: 1.8 },
    { source: 1, target: 7, value: 1.0 },
    { source: 2, target: 7, value: 4.5 },
  ],
};

function CustomSankeyNode({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}: any) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#3b82f6"
        fillOpacity={0.9}
        rx={3}
        stroke="#1d4ed8"
        strokeWidth={1}
      />
      <text
        x={x < 300 ? x + width + 8 : x - 8}
        y={y + height / 2}
        textAnchor={x < 300 ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={500}
        fill="currentColor"
        className="fill-foreground"
      >
        {payload?.name ?? ""}
      </text>
    </g>
  );
}

export function MoneyFlowSankeyChart({
  data = defaultSankeyData,
  height = 360,
}: {
  data?: typeof defaultSankeyData;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          node={CustomSankeyNode}
          nodePadding={32}
          margin={{ top: 20, right: 140, bottom: 20, left: 140 }}
          link={{ stroke: "#60a5fa", strokeOpacity: 0.35 }}
        >
          <Tooltip
            formatter={(value: any) => [`${value}% of total flow`, "Volume Share"]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
