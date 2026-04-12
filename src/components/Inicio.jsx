import { useState, useEffect } from "react";
import { listarCargas } from "../helpers/queriesCargas";
import CargaModal from "./CargaModal";
import MesModal from "./MesModal";
import Swal from "sweetalert2";
import { MESES } from "../constants";

const now = new Date();
const MES_ACTUAL = now.getMonth();
const ANIO_ACTUAL = now.getFullYear();

const formatLitros = (n) => n === 0 ? "-" : n % 1 === 0 ? String(n) : n.toFixed(1);

const Inicio = () => {
  const [cargas, setCargas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [anio, setAnio] = useState(ANIO_ACTUAL);
  const [mesModal, setMesModal] = useState(null);
  const [modoEditar, setModoEditar] = useState(false);
  const [vista, setVista] = useState("inicio");
  const [cupos, setCupos] = useState(() => {
    const s = localStorage.getItem("gasoil-cupos");
    return s ? JSON.parse(s) : {};
  });

  useEffect(() => {
    document.body.style.overflow = vista === "inicio" ? "hidden" : "auto";
    return () => { document.body.style.overflow = ""; };
  }, [vista]);

  useEffect(() => { cargarDatos(); }, []);

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
      inputAttributes: { min: 2026, max: ANIO_ACTUAL, step: 1 },
      confirmButtonText: "Ver",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator: (v) => (!v || parseInt(v) < 2026) ? "El valor debe ser mayor a 2025" : null,
      customClass: {
        popup: "swal-dark",
        confirmButton: "swal-btn-outline-success",
        cancelButton: "swal-btn-outline-secondary",
        validationMessage: "swal-validation",
      },
      buttonsStyling: false,
    });
    if (!isDismissed && value) setAnio(parseInt(value));
  };

  const { total: totalActual, saldo: saldoActual } = getResumen(MES_ACTUAL);

  return (
    <div className="gasoil-container">
      <div className="acciones-row">
        <button className="btn-carga" onClick={() => setShowModal(true)}>CARGA</button>
        <button className="btn-anio" onClick={cambiarAnio}>{anio}</button>
      </div>

      {vista === "inicio" && (
        <div className="inicio-body">
          <div className="mes-actual-card">
            <div className="mac-nombre">{MESES[MES_ACTUAL]}</div>
            <div className="mac-litros">{formatLitros(totalActual)}</div>
            <div className={`mac-saldo${saldoActual < 0 ? " saldo-negativo" : ""}`}>Saldo: {saldoActual}</div>
            <div className="mes-botones" style={{ marginTop: "1rem" }}>
              <button className="mes-btn-ver" onClick={() => { setMesModal(MES_ACTUAL); setModoEditar(false); }}>👁</button>
              <button className="mes-btn-editar" onClick={() => { setMesModal(MES_ACTUAL); setModoEditar(true); }}>✏️</button>
            </div>
          </div>
          <button className="btn-historial" onClick={() => setVista("historial")}>HISTORIAL</button>
        </div>
      )}

      {vista === "historial" && (
        <div>
          <button className="btn-volver" onClick={() => setVista("inicio")}>← Volver</button>
          <div className="meses-grid">
            {MESES.map((mes, i) => {
              if (anio === ANIO_ACTUAL && i > MES_ACTUAL) return null;
              const { total, saldo } = getResumen(i);
              return (
                <div key={i} className={`mes-card${i === MES_ACTUAL && anio === ANIO_ACTUAL ? " mes-actual" : ""}`}>
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

      {showModal && (
        <CargaModal show={showModal} onHide={() => setShowModal(false)} onGuardar={() => { setShowModal(false); cargarDatos(); }} />
      )}

      {mesModal !== null && (
        <MesModal
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
