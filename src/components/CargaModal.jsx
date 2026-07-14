import { useState, useEffect } from "react";
import { crearCarga } from "../helpers/queriesCargas";
import Swal from "sweetalert2";

const hoy = () => new Date().toISOString().split("T")[0];

const CargaModal = ({ show, onHide, onGuardar }) => {
  const [fecha, setFecha] = useState(hoy());
  const [litros, setLitros] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!show) return null;

  const handleGuardar = async () => {
    const l = parseFloat(litros);
    if (!l || l <= 0) return;
    const resp = await crearCarga({ fecha, litros: l });
    if (resp?.ok) {
      Swal.fire({ icon: "success", title: "Carga registrada", timer: 1200, showConfirmButton: false, customClass: { popup: "swal-dark" } });
      setLitros("");
      setFecha(hoy());
      onGuardar();
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.titulo}>Nueva Carga</span>
          <button style={s.btnX} onClick={onHide}>✕</button>
        </div>
        <div style={s.body}>
          <label style={s.label}>Fecha</label>
          <input type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} style={s.input} />
          <label style={{ ...s.label, marginTop: "0.75rem", fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>Litros</label>
          <input
            type="number"
            inputMode="decimal"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGuardar(); }}
            style={s.inputLitros}
          />
        </div>
        <div style={s.footer}>
          <button style={s.btnCancelar} onClick={onHide}>Cancelar</button>
          <button style={s.btnGuardar} onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "0.5rem" },
  modal: { background: "#1e1e1e", border: "1px solid #444", borderRadius: "0.5rem", width: "100%", maxWidth: "480px", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 1rem", borderBottom: "1px solid #444" },
  titulo: { fontWeight: 700, fontSize: "1.1rem" },
  btnX: { background: "none", border: "none", color: "#aaa", fontSize: "1.1rem", cursor: "pointer" },
  body: { padding: "0.4rem 1rem", display: "flex", flexDirection: "column" },
  label: { fontSize: "1rem", color: "#aaa", marginBottom: "0.2rem" },
  input: { padding: "0.4rem", background: "#111", color: "#fff", border: "1px solid #555", borderRadius: "0.375rem", fontSize: "1.1rem", width: "100%" },
  inputLitros: { padding: "0.75rem", background: "#111", color: "#fff", border: "2px solid #7ec8a0", borderRadius: "0.5rem", fontSize: "1.8rem", fontWeight: "bold", textAlign: "center", width: "100%", outline: "none" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", padding: "0.35rem 1rem", borderTop: "1px solid #444" },
  btnCancelar: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.4rem 1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnGuardar: { background: "transparent", border: "1px solid #7ec8a0", color: "#7ec8a0", padding: "0.4rem 1rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 },
};

export default CargaModal;
