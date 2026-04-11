import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { crearCarga } from "../helpers/queriesCargas";
import Swal from "sweetalert2";

const CargaModal = ({ show, onHide, onGuardar }) => {
  const hoy = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { fecha: hoy, litros: "" },
  });

  const onSubmit = async (data) => {
    const resp = await crearCarga({ ...data, litros: parseFloat(data.litros) });
    if (resp?.ok) {
      Swal.fire({
        icon: "success",
        title: "Carga registrada",
        timer: 1200,
        showConfirmButton: false,
        customClass: { popup: "swal-dark" },
      });
      reset({ fecha: hoy, litros: "" });
      onGuardar();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la carga",
        customClass: { popup: "swal-dark" },
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-dark text-light border-secondary">
        <Modal.Title>Nueva Carga</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
        <Form onSubmit={handleSubmit(onSubmit)} id="form-carga">
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              {...register("fecha", { required: "La fecha es obligatoria" })}
              isInvalid={!!errors.fecha}
            />
            <Form.Control.Feedback type="invalid">
              {errors.fecha?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Litros</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              placeholder="Ej: 50"
              autoFocus
              {...register("litros", {
                required: "Los litros son obligatorios",
                min: { value: 0.1, message: "Debe ser mayor a 0" },
              })}
              isInvalid={!!errors.litros}
            />
            <Form.Control.Feedback type="invalid">
              {errors.litros?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-dark border-secondary">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="outline-success" type="submit" form="form-carga">
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CargaModal;
