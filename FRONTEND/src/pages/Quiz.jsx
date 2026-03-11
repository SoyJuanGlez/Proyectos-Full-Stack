import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    style: "",
    color: "",
    occasion: "",
  });

  const handleSubmit = () => {
    navigate("/outfit", { state: answers });
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h2 className="text-3xl mb-6">Descubre tu estilo</h2>

      <select
        onChange={(e) => setAnswers({ ...answers, style: e.target.value })}
        className="w-full p-3 mb-4 bg-gray-800"
      >
        <option value="">Selecciona estilo</option>
        <option value="oversized">Oversized</option>
        <option value="minimal">Minimal</option>
        <option value="techwear">Techwear</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-green-500 w-full py-3 rounded-lg"
      >
        Generar Outfit
      </button>
    </div>
  );
};

export default Quiz;