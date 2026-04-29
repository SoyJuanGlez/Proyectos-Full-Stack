import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "../styles/tryon.css";

const TryOn = () => {

  const outfitRef = useRef();

  const [outfit, setOutfit] = useState({
    top: null,
    bottom: null,
    shoes: null
  });

  const [savedOutfits, setSavedOutfits] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [filterType, setFilterType] = useState("all");
  const [filterColor, setFilterColor] = useState("");

  // 🔥 DETECTOR DE COLOR
  const detectColor = (name) => {
    name = name.toLowerCase();

    if (name.includes("negro") || name.includes("black")) return "negro";
    if (name.includes("blanco") || name.includes("white")) return "blanco";
    if (name.includes("rojo") || name.includes("red")) return "rojo";
    if (name.includes("azul") || name.includes("blue")) return "azul";
    if (name.includes("verde") || name.includes("green")) return "verde";
    if (name.includes("gris") || name.includes("gray")) return "gris";
    if (name.includes("beige")) return "beige";

    return "otro";
  };

  // 🔹 Detectar categoría
  const getCategory = (product) => {
    const name = product.name.toLowerCase();

    if (name.includes("playera") || name.includes("shirt")) return "top";
    if (name.includes("pantal") || name.includes("pants")) return "bottom";
    if (name.includes("tenis") || name.includes("shoe")) return "shoes";

    return "top";
  };

  // 🔹 Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 FILTRADO REAL EN FRONT
  const filteredProducts = products.filter(product => {
    const category = getCategory(product);
    const color = detectColor(product.name);

    const matchesType =
      filterType === "all" || category === filterType;

    const matchesColor =
      filterColor === "" || color === filterColor;

    return matchesType && matchesColor;
  });

  // 🔹 Quitar prenda
  const removeCloth = (type) => {
    setOutfit(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // 🔹 Guardar outfit
  const saveOutfit = () => {
    if (!outfit.top && !outfit.bottom && !outfit.shoes) return;
    setSavedOutfits(prev => [...prev, outfit]);
  };

  // 🔹 Cargar outfit
  const loadOutfit = (o) => {
    setOutfit(o);
  };

  // 🔹 Eliminar outfit
  const deleteOutfit = (index) => {
    setSavedOutfits(prev => prev.filter((_, i) => i !== index));
  };

  // 🔹 Exportar
  const exportOutfit = async () => {
    const canvas = await html2canvas(outfitRef.current);
    const link = document.createElement("a");
    link.download = "outfit.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="tryon-container">

      {/* BOTÓN DRAWER */}
      <button 
        className="open-saved-btn" 
        onClick={() => setShowSaved(prev => !prev)}
      >
        ☰ Outfits
      </button>

      {/* PANEL IZQUIERDO */}
      <div className="left-panel">

        <div className="info-panel">
          <h3>Colorimetría</h3>
          <p>La colorimetría analiza qué colores armonizan con tu tono natural.</p>
          <p>Elegir bien mejora tu presencia visual.</p>
        </div>

        <div className="filters-panel">
          <h4>Filtros</h4>

          {/* TIPO */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos</option>
            <option value="top">Camisas</option>
            <option value="bottom">Pantalones</option>
            <option value="shoes">Calzado</option>
          </select>

          {/* COLOR */}
          <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)}>
            <option value="">Todos los colores</option>
            <option value="negro">Negro</option>
            <option value="blanco">Blanco</option>
            <option value="rojo">Rojo</option>
            <option value="azul">Azul</option>
            <option value="verde">Verde</option>
            <option value="gris">Gris</option>
            <option value="beige">Beige</option>
            <option value="marron">Marrón</option>
            <option value="rosa">Rosa</option>
          </select>

        </div>

      </div>

      {/* MAIN */}
      <div className="tryon-main">

        {/* OUTFIT */}
        <div className="outfit-view" ref={outfitRef}>

          {outfit.top && (
            <div className="outfit-item">
              <img src={outfit.top} />
              <button onClick={() => removeCloth("top")}>X</button>
            </div>
          )}

          {outfit.bottom && (
            <div className="outfit-item">
              <img src={outfit.bottom} />
              <button onClick={() => removeCloth("bottom")}>X</button>
            </div>
          )}

          {outfit.shoes && (
            <div className="outfit-item">
              <img src={outfit.shoes} />
              <button onClick={() => removeCloth("shoes")}>X</button>
            </div>
          )}

          {!outfit.top && !outfit.bottom && !outfit.shoes && (
            <span className="empty-msg">
              Selecciona prendas para crear un outfit
            </span>
          )}
        </div>

        {/* BOTONES */}
        <div className="actions">
          <button onClick={saveOutfit}>Guardar</button>
          <button onClick={exportOutfit}>Exportar</button>
        </div>

        {/* PRODUCTOS */}
        <div className="clothes-bar">
          {loadingProducts ? (
            <span className="loading-text">Cargando prendas...</span>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product._id}
                className="cloth-card"
                onClick={() => {
                  const category = getCategory(product);
                  setOutfit(prev => ({
                    ...prev,
                    [category]: product.image
                  }));
                }}
              >
                <img src={product.image} />
                <span>{product.name}</span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* DRAWER */}
      <div className={`drawer ${showSaved ? "open" : ""}`}>
        <h3>Outfits guardados</h3>

        <div className="saved-list">
          {savedOutfits.map((o, i) => (
            <div key={i} className="saved-card">

              <div className="mini-outfit" onClick={() => loadOutfit(o)}>
                {o.top && <img src={o.top} />}
                {o.bottom && <img src={o.bottom} />}
                {o.shoes && <img src={o.shoes} />}
              </div>

              <button className="delete-btn" onClick={() => deleteOutfit(i)}>
                🗑
              </button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TryOn;