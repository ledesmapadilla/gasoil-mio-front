const API_CARGAS = `${import.meta.env.VITE_API_URL}/api/cargas`;

export const listarCargas = async () => {
  try {
    const respuesta = await fetch(API_CARGAS);
    return respuesta;
  } catch (error) {
    console.error("Error al listar cargas:", error);
    return null;
  }
};

export const crearCarga = async (carga) => {
  try {
    const respuesta = await fetch(API_CARGAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carga),
    });
    return respuesta;
  } catch (error) {
    console.error("Error al crear carga:", error);
    return null;
  }
};

export const editarCarga = async (id, carga) => {
  try {
    const respuesta = await fetch(`${API_CARGAS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carga),
    });
    return respuesta;
  } catch (error) {
    console.error("Error al editar carga:", error);
    return null;
  }
};

export const borrarCarga = async (id) => {
  try {
    const respuesta = await fetch(`${API_CARGAS}/${id}`, {
      method: "DELETE",
    });
    return respuesta;
  } catch (error) {
    console.error("Error al borrar carga:", error);
    return null;
  }
};
