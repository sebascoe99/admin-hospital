import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, cancelAppointment } from '../api/appointments';
import { Search, XCircle } from 'lucide-react';

export default function Appointments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, status, search],
    queryFn: () =>
      getAppointments({
        page,
        pageSize: 15,
        status: status || undefined,
        q: search || undefined,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Citas</h1>
          <p className="text-muted">{total} citas encontradas</p>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <Search size={18} className="input-icon" />
            <input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Todos los estados</option>
            <option value="SCHEDULED">Agendadas</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-muted" style={{ padding: 24 }}>Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-muted" style={{ padding: 24 }}>No se encontraron citas</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a: any) => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : `Paciente #${a.patientId}`}</td>
                  <td>{a.service?.name ?? `Servicio #${a.serviceId}`}</td>
                  <td>{new Date(a.slotStart).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td>
                    {a.status !== 'CANCELLED' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelMutation.mutate(a.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span className="text-muted">Pagina {page} de {totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
