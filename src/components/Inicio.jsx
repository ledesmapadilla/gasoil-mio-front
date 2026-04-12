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
  const [cupos, setCupos] = useState(() => {
    const stored = localStorage.getItem("gasoil-cupos");
    return stored ? JSON.parse(stored) : {};
  });
  const mesActual = new Date().getMonth();

  const getCupo = (mesIndex) => cupos[`${anio}-${mesIndex}`] ?? 140;

  const actualizarCupo = (mesIndex, nuevoCupo) => {
    const key = `${anio}-${mesIndex}`;
    const nuevos = { ...cupos, [key]: nuevoCupo };
    localStorage.setItem("gasoil-cupos", JSON.stringify(nuevos));
    setCupos(nuevos);
  };

  const cargarDatos = async () => {
    const resp = await listarCargas();
    if (resp?.ok) {
      const data = await resp.json();
      setCargas(data);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getCargasMes = (mesIndex) =>
    cargas.filter((c) => {
      const [anioC, mesC] = c.fecha.split("-");
      return parseInt(anioC) === anio && parseInt(mesC) - 1 === mesIndex;
    });

  const getResumenMes = (mesIndex) => {
    const cargasMes = getCargasMes(mesIndex);
    const total = cargasMes.reduce((sum, c) => sum + c.litros, 0);
    const saldo = getCupo(mesIndex) - total;
    return { total, saldo };
  };

  const abrirMes = (i, editar) => {
    setMesModal(i);
    setModoEditar(editar);
  };

  const cambiarAnio = async () => {
    const { value, isDismissed } = await Swal.fire({
      title: "Seleccionar año",
      input: "number",
      inputValue: anio,
      inputAttributes: { min: 2020, max: 2099, step: 1 },
      confirmButtonText: "Ver",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      customClass: { popup: "swal-dark" },
    });
    if (!isDismissed && value) {
      setAnio(parseInt(value));
    }
  };

  return (
    <div className="gasoil-container">
      <div className="acciones-row">
        <button className="btn-carga" onClick={() => setShowModal(true)}>
          CARGA
        </button>
        <button className="btn-anio" onClick={cambiarAnio}>
          {anio}
        </button>
      </div>

      <div className="meses-grid">
        {MESES.map((mes, i) => {
          const { total, saldo } = getResumenMes(i);
          const esActual = i === mesActual;
          const saldoNegativo = saldo < 0;
          return (
            <div key={i} className={`mes-card${esActual ? " mes-actual" : ""}`}>
              <div className="mes-nombre">{mes}</div>
              <div className="mes-litros">{formatLitros(total)}</div>
              <div className={`mes-saldo${saldoNegativo ? " saldo-negativo" : ""}`}>
                Saldo: {saldo}
              </div>
              <div className="mes-botones">
                <button className="mes-btn-ver" onClick={() => abrirMes(i, false)}>
                  <i className="bi bi-eye"></i>
                </button>
                <button className="mes-btn-editar" onClick={() => abrirMes(i, true)}>
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CargaModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onGuardar={() => {
            setShowModal(false);
            cargarDatos();
          }}
        />
      )}

      {mesModal !== null && (
        <MesModal
          show={mesModal !== null}
          onHide={() => setMesModal(null)}
          mes={mesModal}
          anio={anio}
          cargas={getCargasMes(mesModal)}
          modoEditar={modoEditar}
          cupo={getCupo(mesModal)}
          onEditarCupo={(valor) => actualizarCupo(mesModal, valor)}
          onActualizar={cargarDatos}
        />
      )}
    </div>
  );
};

export default Inicio;
