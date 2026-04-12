import { useState } from "react";
import { borrarCarga, editarCarga } from "../helpers/queriesCargas";
import Swal from "sweetalert2";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatearFecha = (fecha) => {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
};

const MesModal = ({ show, onHide, mes, anio, cargas, modoEditar, cupo, onEditarCupo, onActualizar }) => {
  const titulo = `${MESES[mes]} ${anio}`;
  const [litrosPorId, setLitrosPorId] = useState({});
  const [editandoCupo, setEditandoCupo] = useState(false);
  const [cupoEditando, setCupoEditando] = useState("");

  if (!show) return null;

  const getLitros = (c) =>
    litrosPorId[c._id] !== undefined ? litrosPorId[c._id] : String(c.litros);

  const setLitros = (id, val) =>
    setLitrosPorId((prev) => ({ ...prev, [id]: val }));

  const guardarEditar = async (carga) => {
    const litros = parseFloat(getLitros(carga));
    if (!litros || litros <= 0) return;
    const resp = await editarCarga(carga._id, { fecha: carga.fecha, litros });
    if (resp?.ok) {
      onActualizar();
      onHide();
    }
  };

  const handleBorrar = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Borrar esta carga?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Borrar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal-dark",
        confirmButton: "swal-btn-outline-danger",
        cancelButton: "swal-btn-outline-secondary",
      },
      buttonsStyling: false,
    });
    if (!isConfirmed) return;
    const resp = await borrarCarga(id);
    if (resp?.ok) {
      onActualizar();
      onHide();
    } else {
      Swal.fire({ title: "Error al borrar", icon: "error", customClass: { popup: "swal-dark" }, confirmButtonText: "OK" });
    }
  };

  const guardarCupo = () => {
    const n = parseInt(cupoEditando);
    if (isNaN(n) || n < 0) {
      Swal.fire({ title: "Valor inválido", icon: "error", customClass: { popup: "swal-dark" }, confirmButtonText: "OK" });
      return;
    }
    onEditarCupo(n);
    setEditandoCupo(false);
    onHide();
  };

  return (
    <div style={estilos.overlay} onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div style={estilos.modal}>

        {/* Header */}
        <div style={estilos.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={estilos.titulo}>{titulo}</span>
            {modoEditar && (
              editandoCupo ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.8rem" }}>Cupo:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={cupoEditando}
                    onChange={(e) => setCupoEditando(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") guardarCupo(); if (e.key === "Escape") setEditandoCupo(false); }}
                    style={estilos.inputInline}
                  />
                  <button style={estilos.btnVerde} onClick={guardarCupo}>✓</button>
                  <button style={estilos.btnGris} onClick={() => setEditandoCupo(false)}>✕</button>
                </div>
              ) : (
                <button style={estilos.btnCupo} onClick={() => { setCupoEditando(String(cupo)); setEditandoCupo(true); }}>
                  Cupo: {cupo} ✏️
                </button>
              )
            )}
          </div>
          <button style={estilos.btnCerrarX} onClick={onHide}>✕</button>
        </div>

        {/* Body */}
        <div style={estilos.body}>
          {cargas.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", margin: 0 }}>Sin cargas este mes.</p>
          ) : (
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Fecha</th>
                  <th style={estilos.th}>Litros</th>
                  {modoEditar && <th style={estilos.th}></th>}
                </tr>
              </thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c._id}>
                    <td style={estilos.td}>{formatearFecha(c.fecha)}</td>
                    <td style={estilos.td}>
                      {modoEditar ? (
                        <input
                          type="number"
                          inputMode="decimal"
                          value={getLitros(c)}
                          onChange={(e) => setLitros(c._id, e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") guardarEditar(c); }}
                          style={estilos.inputTabla}
                        />
                      ) : (
                        c.litros % 1 === 0 ? c.litros : c.litros.toFixed(1)
                      )}
                    </td>
                    {modoEditar && (
                      <td style={{ ...estilos.td, whiteSpace: "nowrap" }}>
                        <button style={estilos.btnVerde} onClick={() => guardarEditar(c)}>✓</button>
                        {" "}
                        <button style={estilos.btnRojo} onClick={() => handleBorrar(c._id)}>🗑</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={estilos.footer}>
          <button style={estilos.btnCerrar} onClick={onHide}>Cerrar</button>
        </div>

      </div>
    </div>
  );
};

const estilos = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
    padding: "0.5rem",
  },
  modal: {
    background: "#1e1e1e",
    border: "1px solid #444",
    borderRadius: "0.5rem",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #444",
  },
  titulo: { fontSize: "1.3rem", fontWeight: 700 },
  body: { padding: "1rem 1.25rem", overflowY: "auto" },
  footer: {
    padding: "0.75rem 1.25rem",
    borderTop: "1px solid #444",
    display: "flex", justifyContent: "flex-end",
  },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 0.5rem", background: "#2a2a2a", textAlign: "center", fontSize: "1.1rem", borderBottom: "1px solid #444" },
  td: { padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "1.1rem", borderBottom: "1px solid #333" },
  inputInline: {
    width: "90px", padding: "0.35rem 0.5rem",
    background: "#111", color: "#fff",
    border: "1px solid #666", borderRadius: "0.375rem",
    fontSize: "1rem",
  },
  inputTabla: {
    width: "90px", padding: "0.35rem 0.4rem",
    background: "#111", color: "#fff",
    border: "1px solid #555", borderRadius: "0.3rem",
    fontSize: "1rem", textAlign: "center",
  },
  btnCerrarX: { background: "none", border: "none", color: "#aaa", fontSize: "1.3rem", cursor: "pointer" },
  btnCerrar: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.5rem 1.25rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnCupo: { background: "transparent", border: "1px solid #666", color: "#fff", padding: "0.25rem 0.6rem", fontSize: "0.95rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnVerde: { background: "transparent", border: "1px solid #7ec8a0", color: "#7ec8a0", padding: "0.35rem 0.6rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnGris: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.35rem 0.6rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnRojo: { background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem" },
};

export default MesModal;
