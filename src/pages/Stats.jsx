import { useEffect, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import api, { fmtMoney } from '../lib/api'

const GOLD = '#c2a25e'
const SERIES = ['#c2a25e', '#9b7f43', '#b08a6a', '#7d8a6b', '#8a7a6b', '#6b7d8a', '#a3725c']

const tooltipStyle = {
  background: '#1b1916',
  border: '1px solid #2c2823',
  borderRadius: 8,
  color: '#ece7dd',
  fontSize: 12,
}

function Kpi({ label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-medium text-fg-muted">{label}</div>
      <div className="text-2xl font-semibold text-fg mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-fg-faint mt-1">{sub}</div>}
    </div>
  )
}

export default function Stats() {
  const [m, setM] = useState(null)
  const [series, setSeries] = useState([])
  const [byService, setByService] = useState([])

  useEffect(() => {
    api.get('/stats/summary').then(({ data }) => setM(data))
    api.get('/stats/timeseries', { params: { days: 30 } }).then(({ data }) => setSeries(data))
    api.get('/stats/by-service', { params: { days: 30 } }).then(({ data }) => setByService(data))
  }, [])

  const deltaText =
    m && m.week_delta_pct !== null
      ? `${m.week_delta >= 0 ? '+' : ''}${m.week_delta_pct}% к прошлой неделе`
      : 'нет данных за прошлую неделю'

  return (
    <div>
      <p className="text-sm text-fg-muted mb-5">
        Выручка считается по подтверждённым и завершённым броням
      </p>

      {m && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <Kpi label="Выручка за месяц" value={fmtMoney(m.month_revenue)} sub={`${m.month_bookings} броней`} />
          <Kpi label="Выручка за неделю" value={fmtMoney(m.week_revenue)} sub={deltaText} />
          <Kpi label="Средний чек" value={fmtMoney(m.avg_check)} sub="за месяц" />
          <Kpi label="Заявки в ожидании" value={m.pending_bookings} sub="требуют подтверждения" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-fg mb-4">Выручка по дням · 30 дней</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series} margin={{ left: 4, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2c2823" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#736b5c', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#2c2823' }}
                tickFormatter={(d) => d?.slice(5)}
              />
              <YAxis
                tick={{ fill: '#736b5c', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => v / 1000 + 'k'}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmtMoney(v), 'Выручка']} />
              <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#gold)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-fg mb-4">Продажи по услугам</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byService} layout="vertical" margin={{ left: 8, right: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="service_label"
                tick={{ fill: '#a39a89', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} formatter={(v) => [fmtMoney(v), 'Выручка']} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={18}>
                {byService.map((_, i) => (
                  <Cell key={i} fill={SERIES[i % SERIES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
