import { useState, useEffect, useRef } from "react";
import "../styles/quiz.css";

const Quiz = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "¡Hola! Soy tu asistente de OUTF-AI. Cuéntame, ¿qué estilo buscas hoy o para qué evento te vistes?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` // Enviamos el token que ya configuramos
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply, items: data.items }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Lo siento, tuve un problema al conectar con mi cerebro de IA." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            {msg.items && (
              <div className="recommended-items">
                {msg.items.map(item => (
                  <div key={item.id} className="mini-card">{item.name}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message ai">Escribiendo...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ej: Busco algo aesthetic para una cita en la tarde..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default Quiz;