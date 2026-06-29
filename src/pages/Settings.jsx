import { useEffect, useState } from 'react'
import api from '../lib/api'
import Toggle from '../components/Toggle'
import Icon from '../components/Icon'

const UNITS = [
  ['night', 'за ночь'],
  ['hour', 'за час'],
  ['event', 'за событие'],
]
const CATEGORIES = [
  ['accommodation', 'Проживание'],
  ['venue', 'Залы/зоны'],
  ['activity', 'Активности'],
]

const blankService = () => ({
  key: '', label: '', category: 'activity', unit: 'event', capacity: 1, price: 0, active: true,
})

function Section({ title, desc, action, children }) {
  return (
    <section className="card p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {desc && <p className="text-xs text-fg-muted mt-1">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Settings() {
  const [s, setS] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings').then(({ data }) => setS(data))
  }, [])

  if (!s) return <div className="text-fg-faint text-sm">Загрузка…</div>

  const setBiz = (k, v) => setS({ ...s, business: { ...s.business, [k]: v } })
  const setSvc = (i, k, v) => {
    const services = [...s.services]
    services[i] = { ...services[i], [k]: v }
    setS({ ...s, services })
  }
  const addSvc = () => setS({ ...s, services: [...s.services, blankService()] })
  const removeSvc = (i) => setS({ ...s, services: s.services.filter((_, j) => j !== i) })

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const payload = {
        business: {
          ...s.business,
          phones:
            typeof s.business.phones === 'string'
              ? s.business.phones.split(',').map((x) => x.trim()).filter(Boolean)
              : s.business.phones,
        },
        booking_mode: s.booking_mode,
        ignore_groups: s.ignore_groups,
        owner_phone: s.owner_phone || '',
        knowledge: s.knowledge || '',
        services: s.services.map((x) => ({
          ...x,
          capacity: Number(x.capacity) || 1,
          price: Number(x.price) || 0,
        })),
      }
      const { data } = await api.put('/settings', payload)
      setS(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const phonesValue = Array.isArray(s.business.phones)
    ? s.business.phones.join(', ')
    : s.business.phones

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-fg-muted">Бот читает эти настройки автоматически</p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
              <Icon name="check" className="w-4 h-4" />
              Сохранено
            </span>
          )}
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <Section title="Поведение бота">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Режим оформления броней</label>
            <div className="flex gap-2">
              {[
                ['manager', 'Подтверждает менеджер'],
                ['auto', 'Авто-подтверждение'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setS({ ...s, booking_mode: val })}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    s.booking_mode === val
                      ? 'bg-surface-2 text-fg border-gold/40'
                      : 'border-line text-fg-muted hover:bg-surface-2'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-fg-faint mt-2 leading-relaxed">
              «Менеджер»: бот сохраняет заявку как «Ожидает», вы подтверждаете вручную.
              «Авто»: бот проверяет занятость и подтверждает сам.
            </p>
          </div>
          <div className="space-y-4">
            <Toggle
              checked={!!s.ignore_groups}
              onChange={(v) => setS({ ...s, ignore_groups: v })}
              label="Игнорировать групповые чаты"
              hint="Бот не отвечает в группах WhatsApp"
            />
            <div>
              <label className="label">Телефон владельца (для уведомлений)</label>
              <input
                className="input max-w-xs"
                value={s.owner_phone || ''}
                onChange={(e) => setS({ ...s, owner_phone: e.target.value })}
                placeholder="77770000000"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Услуги и цены"
        action={
          <button className="btn-secondary btn-sm" onClick={addSvc}>
            <Icon name="plus" className="w-3.5 h-3.5" />
            Услуга
          </button>
        }
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="th">Ключ</th>
                <th className="th">Название</th>
                <th className="th">Категория</th>
                <th className="th">Ед.</th>
                <th className="th">Мест</th>
                <th className="th">Цена&nbsp;₸</th>
                <th className="th text-center">Вкл.</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {s.services.map((sv, i) => (
                <tr key={i} className="border-b border-line/60 last:border-0">
                  <td className="px-2 py-1.5 w-28">
                    <input className="input py-1.5" value={sv.key} onChange={(e) => setSvc(i, 'key', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5 min-w-[180px]">
                    <input className="input py-1.5" value={sv.label} onChange={(e) => setSvc(i, 'label', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <select className="select py-1.5" value={sv.category} onChange={(e) => setSvc(i, 'category', e.target.value)}>
                      {CATEGORIES.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select className="select py-1.5" value={sv.unit} onChange={(e) => setSvc(i, 'unit', e.target.value)}>
                      {UNITS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 w-20">
                    <input type="number" className="input py-1.5" value={sv.capacity} onChange={(e) => setSvc(i, 'capacity', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5 w-28">
                    <input type="number" className="input py-1.5" value={sv.price} onChange={(e) => setSvc(i, 'price', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-gold"
                      checked={!!sv.active}
                      onChange={(e) => setSvc(i, 'active', e.target.checked)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      className="btn-ghost btn-sm"
                      title="Удалить"
                      onClick={() => removeSvc(i)}
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Информация о базе">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Название</label>
            <input className="input" value={s.business.name || ''} onChange={(e) => setBiz('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Адрес</label>
            <input className="input" value={s.business.address || ''} onChange={(e) => setBiz('address', e.target.value)} />
          </div>
          <div>
            <label className="label">Телефоны (через запятую)</label>
            <input className="input" value={phonesValue || ''} onChange={(e) => setBiz('phones', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Заезд</label>
              <input className="input" value={s.business.checkin_time || ''} onChange={(e) => setBiz('checkin_time', e.target.value)} />
            </div>
            <div>
              <label className="label">Выезд</label>
              <input className="input" value={s.business.checkout_time || ''} onChange={(e) => setBiz('checkout_time', e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="label">Режим работы</label>
            <input className="input" value={s.business.working_hours || ''} onChange={(e) => setBiz('working_hours', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Правила</label>
            <textarea className="textarea min-h-[70px]" value={s.business.rules || ''} onChange={(e) => setBiz('rules', e.target.value)} />
          </div>
        </div>
      </Section>

      <Section
        title="База знаний для бота"
        desc="Свободный текст с фактами о базе — подставляется в системный промпт бота"
      >
        <textarea
          className="textarea min-h-[120px]"
          value={s.knowledge || ''}
          onChange={(e) => setS({ ...s, knowledge: e.target.value })}
        />
      </Section>
    </div>
  )
}
