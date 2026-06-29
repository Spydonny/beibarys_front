import { useEffect, useState } from 'react'
import api from '../lib/api'
import Icon from '../components/Icon'

function fmtTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function Chats() {
  const [chats, setChats] = useState([])
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)
  const [thread, setThread] = useState(null)

  const loadChats = async () => {
    const { data } = await api.get('/chats', { params: search ? { search } : {} })
    setChats(data)
  }

  useEffect(() => {
    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openChat = async (phone) => {
    setActive(phone)
    const { data } = await api.get(`/chats/${phone}`)
    setThread(data)
  }

  return (
    <div>
      <p className="text-sm text-fg-muted mb-5">Диалоги клиентов с ботом</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[72vh]">
        {/* Список диалогов */}
        <div className="card flex flex-col overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              loadChats()
            }}
            className="p-3 border-b border-line relative"
          >
            <Icon name="search" className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-fg-faint" />
            <input
              className="input pl-9"
              placeholder="Поиск по телефону"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex-1 overflow-y-auto">
            {chats.map((c) => (
              <button
                key={c.phone}
                onClick={() => openChat(c.phone)}
                className={`w-full text-left px-4 py-3 border-b border-line/60 transition-colors ${
                  active === c.phone ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                }`}
              >
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-sm text-fg truncate">{c.name || c.phone}</span>
                  <span className="text-xs text-fg-faint shrink-0">{fmtTime(c.last_at)}</span>
                </div>
                <div className="text-xs text-fg-muted truncate mt-1">{c.last_message}</div>
                <div className="text-[11px] text-fg-faint mt-1">{c.count} сообщ.</div>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="px-4 py-12 text-center text-fg-faint text-sm">Диалогов нет</div>
            )}
          </div>
        </div>

        {/* Переписка */}
        <div className="card lg:col-span-2 flex flex-col overflow-hidden">
          {!thread ? (
            <div className="flex-1 flex items-center justify-center text-fg-faint text-sm">
              Выберите диалог слева
            </div>
          ) : (
            <>
              <div className="px-5 h-14 flex items-center border-b border-line">
                <div className="text-sm font-medium text-fg">{active}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {thread.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[75%] rounded-xl px-3.5 py-2 text-sm ${
                        msg.role === 'bot'
                          ? 'bg-surface-2 text-fg/90'
                          : 'bg-gold/15 text-fg border border-gold/20'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-fg-faint mb-1">
                        {msg.role === 'bot' ? 'Бот' : 'Клиент'}
                      </div>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
