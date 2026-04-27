import { useState, useEffect, useRef } from "react";

// ── Configuración ────────────────────────────────────────────────────────────
const STORAGE_KEY   = "outfai_chat_history"; // clave en localStorage
const MAX_MESSAGES  = 60;                    // límite para no superar los ~5 MB
const SCHEMA_VERSION = 1;                    // sube este número si cambias la forma del objeto

// ── Helpers de serialización ─────────────────────────────────────────────────

// Guarda el historial con un timestamp y versión de esquema
const saveToStorage = (messages) => {
  try {
    const payload = {
      v:         SCHEMA_VERSION,
      savedAt:   Date.now(),
      messages,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    // El storage puede lanzar si está lleno (QuotaExceededError)
    console.warn("useChatHistory: no se pudo guardar en localStorage →", err.message);
  }
};

// Lee y valida el historial guardado; devuelve null si no existe o es incompatible
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Si el esquema cambió, descartamos el historial anterior (evita crashes)
    if (parsed.v !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validación mínima: debe ser un array de mensajes con las propiedades esperadas
    if (
      !Array.isArray(parsed.messages) ||
      parsed.messages.some((m) => typeof m.role !== "string" || typeof m.text !== "string")
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.messages;
  } catch {
    // JSON malformado u otro error de lectura → ignoramos
    return null;
  }
};

// ── Hook ──────────────────────────────────────────────────────────────────────
// welcomeMsg: el mensaje inicial que se muestra si no hay historial guardado
const useChatHistory = (welcomeMsg) => {
  // Inicialización lazy: solo ejecuta loadFromStorage una vez al montar
  const [messages, setMessages] = useState(() => {
    const saved = loadFromStorage();
    // Si no hay historial o está vacío, arrancamos con el mensaje de bienvenida
    return saved && saved.length > 0 ? saved : [welcomeMsg];
  });

  // Ref para saber si es el primer render (evitamos sobreescribir storage en el mount)
  const isFirstRender = useRef(true);

  // Guarda en localStorage cada vez que cambia messages, excepto en el primer render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Truncamos al límite antes de guardar (mantenemos los más recientes)
    const toSave = messages.length > MAX_MESSAGES
      ? messages.slice(messages.length - MAX_MESSAGES)
      : messages;

    saveToStorage(toSave);
  }, [messages]);

  // Limpia el historial del estado Y del storage, y vuelve al mensaje de bienvenida
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([welcomeMsg]);
  };

  return { messages, setMessages, clearHistory };
};

export default useChatHistory;