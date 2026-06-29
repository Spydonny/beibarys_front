import { useEffect, useState } from 'react'
import api, { fmtMoney } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import Icon from '../components/Icon'

const STATUS_FILTERS = [
  ['', 'Все'],
  ['pending', 'Ожидают'],
  ['confirmed', 'Подтверждены'],
  ['cancelled', 'Отменены'],
  ['completed', 'Завершены'],
]

const emptyForm = {
  type: 'service',
  service_key: '',
  service_label: '',
  phone: '',
  name: '',
  persons: 1,
  amount: 0,
  check_in: '',
  check_out: '',
  date: '',
  time_from: '',
  time_to: '',
  note: '',
}

function when(b) {
  if (b.type === 'accommodation') return `${b.check_in || '—'} → ${b.check_out || '—'}`
  return `${b.date || '—'}${b.time_from ? ', ' + b.time_from : ''}${b.time_to ? '–' + b.time_to : ''}`
}

export default function Bookings() {
  const [items, setItems] = useState([])
  const [services, setServices] = useState([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (status) params.status = status
      if (search) params.search = search
      const { data } = await api.get('/bookings', { params })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    api.get('/settings').then(({ data }) => setServices(data.services || []))
  }, [])

  const patch = async (b, body) => {
    await api.patch(`/bookings/${b.id}`, body)
    load()
  }

  const onSave = async (form) => {
    const svc = services.find((s) => s.key === form.service_key)
    const body = {
      ...form,
      service_label: svc ? svc.label : form.service_label,
      persons: Number(form.persons) || 1,
      amount: Number(form.amount) || 0,
    }
    if (form.id) {
      const { id, type, service_key, ...rest } = body
      await api.patch(`/bookings/${form.id}`, rest)
    } else {
      await api.post('/bookings', body)
    }
    setEditing(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-fg-muted">Заявки от бота и брони, созданные вручную</p>
        <button className="btn-primary" onClick={() => setEditing({ ...emptyForm })}>
          <Icon name="plus" />
          Новая бронь
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-0.5 bg-surface-1 border border-line rounded-lg p-1">
          {STATUS_FILTERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                status === val
                  ? 'bg-surface-3 text-fg'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
          className="relative ml-auto"
        >
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint" />
          <input
            className="input w-72 pl-9"
            placeholder="Поиск по имени или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="th">Услуга</th>
              <th className="th">Когда</th>
              <th className="th">Клиент</th>
              <th className="th">Чел.</th>
              <th className="th">Сумма</th>
              <th className="th">Статус</th>
              <th className="th text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/40">
                <td className="td font-medium text-fg">{b.service_label || b.service_key}</td>
                <td className="td text-fg-muted whitespace-nowrap">{when(b)}</td>
                <td className="td">
                  <div className="text-fg">{b.name}</div>
                  <div className="text-fg-faint text-xs">{b.phone}</div>
                </td>
                <td className="td text-fg-muted">{b.persons}</td>
                <td className="td text-fg tabular-nums">{fmtMoney(b.amount)}</td>
                <td className="td">
                  <StatusBadge status={b.status} />
                </td>
                <td className="td">
                  <div className="flex justify-end gap-1.5">
                    {b.status === 'pending' && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => patch(b, { status: 'confirmed', notify: true })}
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        Подтвердить
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => patch(b, { status: 'cancelled', notify: true })}
                      >
                        Отменить
                      </button>
                    )}
                    <button
                      className="btn-ghost btn-sm"
                      title="Редактировать"
                      onClick={() => setEditing(b)}
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="td text-center text-fg-faint py-12">
                  Броней не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <BookingModal
          booking={editing}
          services={services}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  )
}

function BookingModal({ booking, services, onClose, onSave }) {
  const [form, setForm] = useState({ ...emptyForm, ...booking })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onPickService = (key) => {
    const svc = services.find((s) => s.key === key)
    setForm((f) => ({
      ...f,
      service_key: key,
      service_label: svc ? svc.label : '',
      type: svc && (svc.unit === 'night' || svc.category === 'accommodation') ? 'accommodation' : 'service',
      amount: f.amount || (svc ? svc.price : 0),
    }))
  }

  const isAcc = form.type === 'accommodation'

  return (
    <Modal
      title={form.id ? 'Редактировать бронь' : 'Новая бронь'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn-primary" onClick={() => onSave(form)}>
            Сохранить
          </button>
        </>
      }
    >
      <div>
        <label className="label">Услуга</label>
        <select
          className="select"
          value={form.service_key}
          onChange={(e) => onPickService(e.target.value)}
          disabled={!!form.id}
        >
          <option value="">— выберите —</option>
          {services.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Имя</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Телефон</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
      </div>

      {isAcc ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Заезд</label>
            <input
              type="date"
              className="input"
              value={form.check_in || ''}
              onChange={(e) => set('check_in', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Выезд</label>
            <input
              type="date"
              className="input"
              value={form.check_out || ''}
              onChange={(e) => set('check_out', e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Дата</label>
            <input
              type="date"
              className="input"
              value={form.date || ''}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
          <div>
            <label className="label">С</label>
            <input
              type="time"
              className="input"
              value={form.time_from || ''}
              onChange={(e) => set('time_from', e.target.value)}
            />
          </div>
          <div>
            <label className="label">До</label>
            <input
              type="time"
              className="input"
              value={form.time_to || ''}
              onChange={(e) => set('time_to', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Человек</label>
          <input
            type="number"
            className="input"
            value={form.persons}
            onChange={(e) => set('persons', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Сумма, ₸</label>
          <input
            type="number"
            className="input"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Заметка</label>
        <input className="input" value={form.note || ''} onChange={(e) => set('note', e.target.value)} />
      </div>
    </Modal>
  )
}
