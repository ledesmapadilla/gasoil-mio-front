import { useState, useEffect, useRef } from "react";
import { crearCarga } from "../helpers/queriesCargas";
import Swal from "sweetalert2";

const hoy = () => {
  const h = new Date();
  return {
    d: String(h.getDate()).padStart(2, "0"),
    m: String(h.getMonth() + 1).padStart(2, "0"),
    a: String(h.getFullYear()),
  };
};

const CargaModal = ({ show, onHide, onGuardar }) => {
  const ini = hoy();
  const [dia, setDia] = useState(ini.d);
  const [mes, setMes] = useState(ini.m);
  const [anio, setAnio] = useState(ini.a);
  const [litros, setLitros] = useState("");
  const refMes = useRef();
  const refAnio = useRef();
  const refLitros = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!show) return null;

  const handleGuardar = async () => {
    const fecha = `${anio}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}`;
    const f = new Date(fecha);
    if (isNaN(f) || f > new Date()) {
      Swal.fire({ title: "Fecha inválida", icon: "error", customClass: { popup: "swal-dark" }, confirmButtonText: "OK" });
      return;
    }
    const l = parseFloat(litros);
    if (!l || l <= 0) return;
    const resp = await crearCarga({ fecha, litros: l });
    if (resp?.ok) {
      Swal.fire({ icon: "success", title: "Carga registrada", timer: 1200, showConfirmButton: false, customClass: { popup: "swal-dark" } });
      const n = hoy();
      setDia(n.d); setMes(n.m); setAnio(n.a); setLitros("");
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
          <div style={s.fechaRow}>
            <input
              type="text" inputMode="numeric" maxLength={2}
              value={dia} placeholder="DD"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setDia(v);
                if (v.length === 2) refMes.current?.focus();
              }}
              style={s.inputFecha}
            />
            <span style={s.sep}>/</span>
            <input
              ref={refMes} type="text" inputMode="numeric" maxLength={2}
              value={mes} placeholder="MM"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setMes(v);
                if (v.length === 2) refAnio.current?.focus();
              }}
              style={s.inputFecha}
            />
            <span style={s.sep}>/</span>
            <input
              ref={refAnio} type="text" inputMode="numeric" maxLength={4}
              value={anio} placeholder="AAAA"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setAnio(v);
                if (v.length === 4) refLitros.current?.focus();
              }}
              style={{ ...s.inputFecha, width: "70px" }}
            />
          </div>
          <label style={{ ...s.label, marginTop: "0.75rem" }}>Litros</label>
          <input
            ref={refLitros}
            type="text" inputMode="decimal"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGuardar(); }}
            placeholder="Ej: 50"
            style={s.input}
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #444" },
  titulo: { fontWeight: 700, fontSize: "1.1rem" },
  btnX: { background: "none", border: "none", color: "#aaa", fontSize: "1.1rem", cursor: "pointer" },
  body: { padding: "1rem", display: "flex", flexDirection: "column" },
  label: { fontSize: "1rem", color: "#aaa", marginBottom: "0.4rem" },
  fechaRow: { display: "flex", alignItems: "center", gap: "0.25rem" },
  sep: { fontSize: "1.2rem", color: "#aaa" },
  inputFecha: { width: "48px", padding: "0.75rem 0.4rem", background: "#111", color: "#fff", border: "1px solid #555", borderRadius: "0.375rem", fontSize: "1.1rem", textAlign: "center" },
  input: { padding: "0.75rem", background: "#111", color: "#fff", border: "1px solid #555", borderRadius: "0.375rem", fontSize: "1.1rem", width: "100%" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", padding: "0.75rem 1rem", borderTop: "1px solid #444" },
  btnCancelar: { background: "transparent", border: "1px solid #666", color: "#aaa", padding: "0.4rem 1rem", borderRadius: "0.375rem", cursor: "pointer" },
  btnGuardar: { background: "transparent", border: "1px solid #7ec8a0", color: "#7ec8a0", padding: "0.4rem 1rem", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 },
};

export default CargaModal;
