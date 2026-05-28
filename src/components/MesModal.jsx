import { useState, useEffect } from "react";
import { borrarCarga, editarCarga } from "../helpers/queriesCargas";
import Swal from "sweetalert2";
import { MESES } from "../constants";

const formatearFecha = (fecha) => {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
};

const MesModal = ({ onHide, mes, anio, cargas, modoEditar, cupo, cupoEfectivo, onEditarCupo, onActualizar }) => {
  const [litrosPorId, setLitrosPorId] = useState({});
  const [editandoCupo, setEditandoCupo] = useState(false);
  const [cupoEditando, setCupoEditando] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getLitros = (c) => litrosPorId[c._id] !== undefined ? litrosPorId[c._id] : String(c.litros);
  const setLitros = (id, val) => setLitrosPorId((prev) => ({ ...prev, [id]: val }));

  const guardarEditar = async (carga) => {
    const litros = parseFloat(getLitros(carga));
    if (!litros || litros <= 0) return;
    const resp = await editarCarga(carga._id, { fecha: carga.fecha, litros });
    if (resp?.ok) { onActualizar(); onHide(); }
  };

  const handleBorrar = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Borrar esta carga?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Borrar",
      cancelButtonText: "Cancelar",
      customClass: { popup: "swal-dark", confirmButton: "swal-btn-outline-danger", cancelButton: "swal-btn-outline-secondary" },
      buttonsStyling: false,
    });
    if (!isConfirmed) return;
    const resp = await borrarCarga(id);
    if (resp?.ok) {
      onActualizar(); onHide();
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
    <div style={e.overlay} onClick={(ev) => { if (ev.target === ev.currentTarget) onHide(); }}>
      <div style={e.modal}>
        <div style={e.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={e.titulo}>{MESES[mes]} {anio}</span>
            {modoEditar && (editandoCupo ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.8rem" }}>Cupo:</span>
                <input type="text" inputMode="numeric" autoFocus value={cupoEditando}
                  onChange={(ev) => setCupoEditando(ev.target.value)}
                  onKeyDown={(ev) => { if (ev.key === "Enter") guardarCupo(); if (ev.key === "Escape") setEditandoCupo(false); }}
                  style={e.inputInline} />
                <button style={e.btnVerde} onClick={guardarCupo}>✓</button>
                <button style={e.btnGris} onClick={() => setEditandoCupo(false)}>✕</button>
              </div>
            ) : (
              <button style={e.btnCupo} onClick={() => { setCupoEditando(String(cupo)); setEditandoCupo(true); }}>Cupo: {cupo} ✏️</button>
            ))}
          </div>
          <button style={e.btnCerrarX} onClick={onHide}>✕</button>
        </div>

        <div style={e.body}>
          {cargas.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", margin: 0 }}>Sin cargas este mes.</p>
          ) : (
            <table style={e.tabla}>
              <thead>
                <tr>
                  <th style={e.th}>Fecha</th>
                  <th style={e.th}>Litros</th>
                  {modoEditar && <th style={e.th}></th>}
                </tr>
              </thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c._id}>
                    <td style={e.td}>{formatearFecha(c.fecha)}</td>
                    <td style={e.td}>
                      {modoEditar ? (
                        <input type="number" inputMode="decimal" value={getLitros(c)}
                          onChange={(ev) => setLitros(c._id, ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === "Enter") guardarEditar(c); }}
                          style={e.inputTabla} />
                      ) : (
                        c.litros % 1 === 0 ? c.litros : c.litros.toFixed(1)
                      )}
                    </td>
                    {modoEditar && (
                      <td style={{ ...e.td, whiteSpace: "nowrap" }}>
                        <button style={e.btnVerde} onClick={() => guardarEditar(c)}>✓</button>
                        {" "}
                        <button style={e.btnRojo} onClick={() => handleBorrar(c._id)}>🗑</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(() => {
          const totalL = cargas.reduce((s, c) => s + c.litros, 0);
          const saldo = (cupoEfectivo ?? cupo) - totalL;
          const totalStr = totalL % 1 === 0 ? String(totalL) : totalL.toFixed(1);
          return (
            <div style={e.footer}>
              <div style={e.footerResumen}>
                <span style={{ color: "#8899cc" }}>Total: {totalStr} L</span>
                <span style={{ color: saldo < 0 ? "#c47a8a" : "#7ec8a0" }}>Saldo: {saldo}</span>
              </div>
              <button style={e.btnCerrar} onClick={onHide}>Cerrar</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const e = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "0.5rem" },
  modal: { background: "#1e1e1e", border: "1px solid #444", borderRadius: "0.5rem", width: "100%", maxWidth: "560px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #444" },
  titulo: { fontSize: "1.3rem", fontWeight: 700 },
  body: { padding: "1rem 1.25rem", overflowY: "auto" },
  footer: { padding: "0.75rem 1.25rem", borderTop: "1px solid #444", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerResumen: { display: "flex", gap: "1rem", fontSize: "1rem", fontWeight: 600 },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 0.5rem", background: "#2a2a2a", textAlign: "center", fontSize: "1.1rem", borderBottom: "1px solid #444" },
  td: { padding: "0.75rem 0.5rem", textAlign: "center", fontSize: "1.1rem", borderBottom: "1px solid #333" },
  inputInline: { width: "90px", padding: "0.35rem 0.5rem", background: "#111", color: "#fff", border: "1px solid #666", borderRadius: "0.375rem", fontSize: "1rem" },
  inputTabla: { width: "90px", padding: "0.35rem 0.4rem", background: "#111", color: "#fff", border: "1px solid #555", borderRadius: "0.3rem", fontSize: "1rem", textAlign: "center" },
  btnCerrarX: { background: "none", border: "none", color: "#aaa", fontSize: "1.3rem", cursor: "pointer" },
  btnCerrar: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.5rem 1.25rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnCupo: { background: "transparent", border: "1px solid #666", color: "#fff", padding: "0.25rem 0.6rem", fontSize: "0.95rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnVerde: { background: "transparent", border: "1px solid #7ec8a0", color: "#7ec8a0", padding: "0.35rem 0.6rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnGris: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.35rem 0.6rem", fontSize: "1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnRojo: { background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem" },
};

export default MesModal;
