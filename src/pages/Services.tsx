import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  createService,
  updateService,
  type CreateServicePayload,
  type Service,
} from '../api/services';
import { Plus, Search, Clock, Users, X, Check, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export default function Services() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['services', search],
    queryFn: () => getServices({ q: search || undefined, onlyActive: 'false', pageSize: 100 }),
  });

  const toggleMutation = useMutation({
    mutationFn: (s: Service) => updateService(s.id, { isActive: !s.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const services: Service[] = data?.items ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Servicios</h1>
          <p className="text-muted">Gestiona los servicios de la clinica</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Nuevo servicio
        </button>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <Search size={18} className="input-icon" />
            <input
              placeholder="Buscar servicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted" style={{ padding: 24 }}>Cargando...</p>
        ) : services.length === 0 ? (
          <p className="text-muted" style={{ padding: 24 }}>No se encontraron servicios</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Duracion</th>
                <th>Capacidad</th>
                <th>Cancelacion</th>
                <th>Estado</th>
                <th>Horarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="inline-icon"><Clock size={14} /> {s.slotMinutes} min</span></td>
                  <td><span className="inline-icon"><Users size={14} /> {s.capacityPerSlot} pac.</span></td>
                  <td>{s.cancellationHours}h antes</td>
                  <td>
                    <button
                      className={`badge-btn ${s.isActive ? 'badge-active' : 'badge-inactive'}`}
                      onClick={() => toggleMutation.mutate(s)}
                      title={s.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {s.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {s.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    {s.schedules?.length
                      ? <span className="text-muted">{s.schedules.length} horarios</span>
                      : <span className="text-muted">Sin horarios</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditService(s)}>
                      <Pencil size={14} /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <ServiceModal
          title="Nuevo servicio"
          onClose={() => setShowCreate(false)}
        />
      )}
      {editService && (
        <ServiceModal
          title="Editar servicio"
          service={editService}
          onClose={() => setEditService(null)}
        />
      )}
    </div>
  );
}

function ServiceModal({
  title,
  service,
  onClose,
}: {
  title: string;
  service?: Service;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!service;

  const [name, setName] = useState(service?.name ?? '');
  const [slotMinutes, setSlotMinutes] = useState(service?.slotMinutes ?? 30);
  const [capacityPerSlot, setCapacityPerSlot] = useState(service?.capacityPerSlot ?? 1);
  const [cancellationHours, setCancellationHours] = useState(service?.cancellationHours ?? 24);
  const [schedules, setSchedules] = useState<{ weekday: number; startTime: string; endTime: string }[]>(
    service?.schedules?.map((s) => ({ weekday: s.weekday, startTime: s.startTime, endTime: s.endTime })) ?? [],
  );
  const [error, setError] = useState('');

  const createMut = useMutation({
    mutationFn: createService,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); onClose(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Error al crear'),
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<CreateServicePayload>) => updateService(service!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); onClose(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Error al actualizar'),
  });

  const isPending = createMut.isPending || updateMut.isPending;

  const addSchedule = () => {
    setSchedules([...schedules, { weekday: 1, startTime: '08:00', endTime: '17:00' }]);
  };

  const addWeekdays = () => {
    const newSchedules = [];
    for (let day = 1; day <= 5; day++) {
      newSchedules.push({ weekday: day, startTime: '08:00', endTime: '13:00' });
      newSchedules.push({ weekday: day, startTime: '14:00', endTime: '17:00' });
    }
    setSchedules(newSchedules);
  };

  const removeSchedule = (i: number) => setSchedules(schedules.filter((_, idx) => idx !== i));

  const updateSchedule = (i: number, field: string, value: string | number) => {
    const updated = [...schedules];
    (updated[i] as any)[field] = value;
    setSchedules(updated);
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    setError('');
    const payload: CreateServicePayload = {
      name: name.trim(),
      slotMinutes,
      capacityPerSlot,
      cancellationHours,
      schedules,
    };
    if (isEdit) {
      updateMut.mutate(payload);
    } else {
      createMut.mutate(payload);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-group">
            <label>Nombre del servicio</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Mamografia" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duracion (min)</label>
              <input type="number" value={slotMinutes} onChange={(e) => setSlotMinutes(+e.target.value)} min={5} />
            </div>
            <div className="form-group">
              <label>Capacidad por turno</label>
              <input type="number" value={capacityPerSlot} onChange={(e) => setCapacityPerSlot(+e.target.value)} min={1} />
            </div>
            <div className="form-group">
              <label>Cancelacion (horas antes)</label>
              <input type="number" value={cancellationHours} onChange={(e) => setCancellationHours(+e.target.value)} min={1} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h3>Horarios semanales</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={addWeekdays}>
                  Lun-Vie
                </button>
                <button className="btn btn-outline btn-sm" onClick={addSchedule}>
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {schedules.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13 }}>
                Sin horarios configurados.
              </p>
            )}

            {schedules.map((sc, i) => (
              <div key={i} className="schedule-row">
                <select value={sc.weekday} onChange={(e) => updateSchedule(i, 'weekday', +e.target.value)}>
                  {WEEKDAYS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                </select>
                <input type="time" value={sc.startTime} onChange={(e) => updateSchedule(i, 'startTime', e.target.value)} />
                <span className="text-muted">a</span>
                <input type="time" value={sc.endTime} onChange={(e) => updateSchedule(i, 'endTime', e.target.value)} />
                <button className="btn-icon btn-danger-icon" onClick={() => removeSchedule(i)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
            <Check size={18} />
            {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </div>
      </div>
    </div>
  );
}
