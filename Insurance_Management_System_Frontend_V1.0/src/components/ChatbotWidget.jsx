import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, RefreshCw, Bot, User } from "lucide-react"
import { useAuth } from "../lib/auth-context.jsx"
import { CORE_API, request } from "../lib/api.js"

const GREETINGS = {
  admin: "Hi! I'm the AegisInsure assistant. Ask me anything about customers, policies, claims, payments or notifications - I can see the whole database.",
  customer: "Hi! I'm the AegisInsure assistant. Ask me about your policies, claims, payments or notifications, or about any of our policy plans.",
}

// Kept intentionally small - just enough for natural follow-up questions ("and what about the
// second one?") without sending the whole conversation on every request.
const MAX_HISTORY_TURNS = 6

function Message({ role, content, sources, isError }) {
  const isUser = role === "user"
  return (
    <div className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 me-2">
          <div
            className={`d-inline-flex align-items-center justify-content-center rounded-circle ${isError ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"}`}
            style={{ width: 28, height: 28 }}
          >
            <Bot size={15} />
          </div>
        </div>
      )}
      <div style={{ maxWidth: "78%" }}>
        <div
          className={`p-2 px-3 rounded-4 small ${
            isUser ? "bg-primary text-white" : isError ? "bg-danger-subtle text-danger-emphasis" : "bg-light border"
          }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {content}
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-1 d-flex flex-wrap gap-1">
            {sources.slice(0, 5).map((s) => (
              <span key={s.id} className="badge text-bg-light border text-muted" style={{ fontSize: "0.65rem" }} title={s.snippet}>
                {s.table}
              </span>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 ms-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle text-secondary" style={{ width: 28, height: 28 }}>
            <User size={15} />
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatbotWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [reindexing, setReindexing] = useState(false)
  const [reindexNote, setReindexNote] = useState("")
  const scrollRef = useRef(null)

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: GREETINGS[user?.role] || GREETINGS.customer }])
    }
  }, [open, messages.length, user?.role])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  if (!user) return null

  async function sendMessage(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const history = messages
      .filter((m) => !m.isError)
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setSending(true)
    try {
      const response = await request(`${CORE_API}/chatbot/query`, {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
      })
      setMessages((prev) => [...prev, { role: "assistant", content: response.answer, sources: response.sources }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err.message || "Something went wrong reaching the assistant. Please try again.", isError: true },
      ])
    } finally {
      setSending(false)
    }
  }

  async function reindex() {
    if (reindexing) return
    setReindexing(true)
    setReindexNote("")
    try {
      const result = await request(`${CORE_API}/chatbot/reindex`, { method: "POST" })
      setReindexNote(`Knowledge base rebuilt - ${result.totalChunks ?? "?"} records indexed.`)
    } catch (err) {
      setReindexNote(err.message || "Reindex failed.")
    } finally {
      setReindexing(false)
      setTimeout(() => setReindexNote(""), 6000)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, zIndex: 1060 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          className="card border-0 shadow-lg"
          style={{ position: "fixed", bottom: 92, right: 24, width: 360, maxWidth: "92vw", height: 500, maxHeight: "75vh", zIndex: 1059 }}
        >
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-primary text-white rounded-top">
            <div>
              <p className="fw-semibold mb-0 small">AegisInsure Assistant</p>
              <p className="mb-0 text-white-50" style={{ fontSize: "0.7rem" }}>
                {isAdmin ? "Full database access" : "Your account data + policy catalog"}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1"
                onClick={reindex}
                disabled={reindexing}
                title="Rebuild the chatbot's knowledge base from the latest database data"
              >
                <RefreshCw size={13} className={reindexing ? "spin" : ""} />
              </button>
            )}
          </div>

          {reindexNote && <div className="px-3 py-1 small text-muted border-bottom">{reindexNote}</div>}

          <div ref={scrollRef} className="flex-grow-1 overflow-auto p-3" style={{ flex: 1 }}>
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} sources={m.sources} isError={m.isError} />
            ))}
            {sending && (
              <div className="d-flex align-items-center gap-2 text-muted small">
                <div className="spinner-border spinner-border-sm" role="status" />
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-2 border-top d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Ask about policies, claims, payments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              maxLength={2000}
            />
            <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center" disabled={sending || !input.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
