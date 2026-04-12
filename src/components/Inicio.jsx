import { useState, useEffect } from "react";
import { listarCargas } from "../helpers/queriesCargas";
import CargaModal from "./CargaModal";
import MesModal from "./MesModal";
import Swal from "sweetalert2";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatLitros = (n) => {
  if (n === 0) return "-";
  return n % 1 === 0 ? String(n) : n.toFixed(1);
};

const Inicio = () => {
  const [cargas, setCargas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mesModal, setMesModal] = useState(null);
  const [modoEditar, setModoEditar] = useState(false);
  const [vista, setVista] = useState("inicio"); // "inicio" | "historial"
  const [cupos, setCupos] = useState(() => {
    const s = localStorage.getItem("gasoil-cupos");
    return s ? JSON.parse(s) : {};
  });
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();

  useEffect(() => {
    document.body.style.overflow = vista === "inicio" ? "hidden" : "auto";
    return () => { document.body.style.overflow = ""; };
  }, [vista]);

  const getCupo = (i) => cupos[`${anio}-${i}`] ?? 140;

  const actualizarCupo = (i, val) => {
    const key = `${anio}-${i}`;
    const nuevos = { ...cupos, [key]: val };
    localStorage.setItem("gasoil-cupos", JSON.stringify(nuevos));
    setCupos(nuevos);
  };

  const cargarDatos = async () => {
    const resp = await listarCargas();
    if (resp?.ok) setCargas(await resp.json());
  };

  useEffect(() => { cargarDatos(); }, []);

  const getCargasMes = (i) =>
    cargas.filter((c) => {
      const [a, m] = c.fecha.split("-");
      return parseInt(a) === anio && parseInt(m) - 1 === i;
    });

  const getResumen = (i) => {
    const total = getCargasMes(i).reduce((s, c) => s + c.litros, 0);
    return { total, saldo: getCupo(i) - total };
  };

  const cambiarAnio = async () => {
    const { value, isDismissed } = await Swal.fire({
      title: "Seleccionar año",
      input: "number",
      inputValue: anio,
      inputAttributes: { min: 2026, max: anioActual, step: 1 },
      confirmButtonText: "Ver",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal-dark",
        confirmButton: "swal-btn-outline-success",
        cancelButton: "swal-btn-outline-secondary",
      },
      buttonsStyling: false,
    });
    if (!isDismissed && value) setAnio(parseInt(value));
  };

  const { total: totalActual, saldo: saldoActual } = getResumen(mesActual);

  return (
    <div className="gasoil-container">

      {/* ── Fila de acciones ── */}
      <div className="acciones-row">
        <button className="btn-carga" onClick={() => setShowModal(true)}>CARGA</button>
        <button className="btn-anio" onClick={cambiarAnio}>{anio}</button>
      </div>

      {/* ── Vista inicio ── */}
      {vista === "inicio" && (
        <div className="inicio-body">
          <div className="mes-actual-card">
            <div className="mac-nombre">{MESES[mesActual]}</div>
            <div className="mac-litros">{formatLitros(totalActual)}</div>
            <div className={`mac-saldo${saldoActual < 0 ? " saldo-negativo" : ""}`}>
              Saldo: {saldoActual}
            </div>
            <div className="mes-botones" style={{ marginTop: "1rem" }}>
              <button className="mes-btn-ver" onClick={() => { setMesModal(mesActual); setModoEditar(false); }}>👁</button>
              <button className="mes-btn-editar" onClick={() => { setMesModal(mesActual); setModoEditar(true); }}>✏️</button>
            </div>
          </div>

          <button className="btn-historial" onClick={() => setVista("historial")}>
            HISTORIAL
          </button>
        </div>
      )}

      {/* ── Vista historial ── */}
      {vista === "historial" && (
        <div>
          <button className="btn-volver" onClick={() => setVista("inicio")}>← Volver</button>
          <div className="meses-grid">
            {MESES.map((mes, i) => {
              if (anio === anioActual && i > mesActual) return null;
              const { total, saldo } = getResumen(i);
              return (
                <div key={i} className={`mes-card${i === mesActual && anio === anioActual ? " mes-actual" : ""}`}>
                  <div className="mes-nombre">{mes}</div>
                  <div className="mes-litros">{formatLitros(total)}</div>
                  <div className={`mes-saldo${saldo < 0 ? " saldo-negativo" : ""}`}>Saldo: {saldo}</div>
                  <div className="mes-botones">
                    <button className="mes-btn-ver" onClick={() => { setMesModal(i); setModoEditar(false); }}>👁</button>
                    <button className="mes-btn-editar" onClick={() => { setMesModal(i); setModoEditar(true); }}>✏️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modales ── */}
      {showModal && (
        <CargaModal show onHide={() => setShowModal(false)} onGuardar={() => { setShowModal(false); cargarDatos(); }} />
      )}

      {mesModal !== null && (
        <MesModal
          show
          onHide={() => setMesModal(null)}
          mes={mesModal}
          anio={anio}
          cargas={getCargasMes(mesModal)}
          modoEditar={modoEditar}
          cupo={getCupo(mesModal)}
          onEditarCupo={(val) => actualizarCupo(mesModal, val)}
          onActualizar={cargarDatos}
        />
      )}
    </div>
  );
};

export default Inicio;
