
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/quiz.css";

// Mensaje inicial de bienvenida que ve el usuario al abrir el chat
const WELCOME_MSG = {
  role: "ai",
  text: "¡Hola! Soy tu asistente de OUTF-AI 👗 Cuéntame, ¿qué estilo buscas hoy o para qué evento te vistes?",
};

const Quiz = () => {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll al último mensaje cada vez que cambia la lista
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Envía el mensaje al backend ────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return; // Evitamos envíos vacíos o dobles

    // Agrega el mensaje del usuario a la conversación
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Enviamos el JWT guardado en localStorage para pasar el middleware de auth
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: text }),
      });

      // Si el servidor devuelve un error HTTP, lo manejamos con un mensaje amigable
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const data = await res.json();

      // Detectar la respuesta de "no encontré resultados" para no mostrar tarjetas vacías
      const isNoResults =
        !data.reply ||
        data.reply.toLowerCase().includes("no encontré resultados");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "No encontré resultados. Intenta pedirme un outfit o una prenda específica.",
          // Solo guardamos items si hay productos y no es la respuesta de "sin resultados"
          items: isNoResults ? [] : data.items || [],
        },
      ]);
    } catch (error) {
      // Error de red o de servidor → mensaje de fallback
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ ${error.message || "Tuve un problema al conectarme. Inténtalo de nuevo."}`,
          items: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Permite enviar con la tecla Enter ──────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="chat-container">

      {/* ── Encabezado del chat ── */}
      <div className="chat-header">
        <span className="chat-header-icon">🤖</span>
        <div>
          <h2>OUTF-AI Assistant</h2>
          <p>Tu asesor de moda personal</p>
        </div>
      </div>

      {/* ── Historial de mensajes ── */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>

            {/* Burbuja de texto */}
            <p>{msg.text}</p>

            {/* Tarjetas de productos (solo en mensajes de la IA con items) */}
            {msg.items && msg.items.length > 0 && (
              <div className="recommended-items">
                {msg.items.map((item) => (
                  <div
                    key={item._id}
                    className="mini-card"
                    onClick={() => navigate(`/product/${item._id}`)}
                    title={`Ver ${item.name}`}
                  >
                    {/* Imagen del producto con fallback si no carga */}
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
                      {/* Badge de color opcional */}
                      {item.color && (
                        <span className="mini-color">{item.color}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de "escribiendo..." mientras esperamos la respuesta */}
        {loading && (
          <div className="message ai typing">
            <span />
            <span />
            <span />
          </div>
        )}

        {/* Ancla invisible para el auto-scroll */}
        <div ref={chatEndRef} />
      </div>

      {/* ── Área de entrada de texto ── */}
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