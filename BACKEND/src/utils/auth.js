// Devuelve el token guardado en localStorage.
export const getToken = () => localStorage.getItem("token");

// Considera autenticado al usuario si existe token persistido.
export const isAuthenticated = () => !!getToken();

// Elimina el token local para cerrar sesion en cliente.
export const logout = () => {
  localStorage.removeItem("token");
};
