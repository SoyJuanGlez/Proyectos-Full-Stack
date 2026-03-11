import { useLocation } from "react-router-dom";

const OutfitResult = () => {
  const location = useLocation();
  const answers = location.state;

  return (
    <div className="p-10">
      <h2 className="text-3xl mb-6">Tu Outfit Ideal</h2>
      <pre>{JSON.stringify(answers, null, 2)}</pre>
    </div>
  );
};

export default OutfitResult;