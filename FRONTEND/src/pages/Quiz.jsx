import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useChatHistory from "../hooks/useChatHistory";
import "../styles/quiz.css";

const WELCOME_MSG = {
  role:      "ai",
  text:      "¡Hola! Soy tu asistente de OUTF-AI 👗 Cuéntame, ¿qué estilo buscas hoy o para qué evento te vistes?",
  timestamp: Date.now(),
  items:     [],
};

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit",
  });
};

const Quiz = () => {
  const { messages, setMessages, clearHistory } = useChatHistory(WELCOME_MSG);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text, timestamp: Date.now(), items: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const data = await res.json();
      const isNoResults =
        !data.reply || data.reply.toLowerCase().includes("no encontré resultados");

      setMessages((prev) => [
        ...prev,
        {
          role:      "ai",
          text:      data.reply || "No encontré resultados. Intenta pedirme un outfit o una prenda específica.",
          timestamp: Date.now(),
          items:     isNoResults ? [] : (data.items || []),
          isOutfit:  !isNoResults && !!data.isOutfit,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role:      "ai",
          text:      `⚠️ ${error.message || "Tuve un problema al conectarme. Inténtalo de nuevo."}`,
          timestamp: Date.now(),
          items:     [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Borrar todo el historial del chat?")) clearHistory();
  };

  return (
    <div className="chat-container">

      {/* ── Encabezado ── */}
      <div className="chat-header">
        <span className="chat-header-icon">🤖</span>
        <div className="chat-header-text">
          <h2>OUTF-AI Assistant</h2>
          <p>Tu asesor de moda personal</p>
        </div>
        {messages.length > 1 && (
          <button
            className="btn-clear-history"
            onClick={handleClearHistory}
            title="Borrar historial"
            aria-label="Limpiar historial del chat"
          >
            🗑️ Limpiar
          </button>
        )}
      </div>

      {/* ── Mensajes ── */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.text}</p>

            {msg.items && msg.items.length > 0 && (
              <div className={`recommended-items${msg.isOutfit ? " outfit-grid" : ""}`}>
                {/* Encabezado solo para outfits */}
                {msg.isOutfit && (
                  <div className="outfit-header">
                    <span>✨ Outfit completo</span>
                    <span className="outfit-count">{msg.items.length} prendas</span>
                  </div>
                )}
                <div className="items-grid">
                  {msg.items.map((item) => (
                    <div
                      key={item._id}
                      className={`mini-card${msg.isOutfit ? " outfit-piece" : ""}`}
                      onClick={() => navigate(`/product/${item._id}`)}
                      title={`Ver ${item.name}`}
                    >
                      {/* Badge de categoría */}
                      {item.category && (
                        <span className="mini-category-badge">{item.category}</span>
                      )}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="mini-card-img"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80x80?text=👕";
                        }}
                      />
                      <div className="mini-card-info">
                        <span className="mini-name">{item.name}</span>
                        <span className="mini-price">${item.price}</span>
                        {item.color && <span className="mini-color">{item.color}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {msg.timestamp && (
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="message ai typing" aria-label="La IA está escribiendo">
            <span /><span /><span />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Busco algo aesthetic para una cita en la tarde..."
          disabled={loading}
          aria-label="Escribe tu mensaje"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Enviar mensaje"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>

    </div>
  );
};

export default Quiz;