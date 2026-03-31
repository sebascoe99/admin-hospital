import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/services';
import { getAppointments } from '../api/appointments';
import { getMe } from '../api/auth';
import { Stethoscope, CalendarDays, Users, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: services } = useQuery({
    queryKey: ['services-dash'],
    queryFn: () => getServices({ onlyActive: 'false', pageSize: 100 }),
  });
  const { data: appointments } = useQuery({
    queryKey: ['appointments-dash'],
    queryFn: () => getAppointments({ pageSize: 5, status: 'SCHEDULED' }),
  });

  const totalServices = services?.items?.length ?? 0;
  const activeServices = services?.items?.filter((s: any) => s.isActive).length ?? 0;
  const totalAppointments = appointments?.total ?? 0;
  const userName = me?.patient
    ? `${me.patient.firstName} ${me.patient.lastName}`
    : me?.email ?? '';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Bienvenido, {userName}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Stethoscope size={22} />}
          label="Servicios activos"
          value={activeServices}
          color="#0A66C2"
        />
        <StatCard
          icon={<Activity size={22} />}
          label="Total servicios"
          value={totalServices}
          color="#059669"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Citas pendientes"
          value={totalAppointments}
          color="#d97706"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Ubicacion"
          value="Duran, GYE"
          color="#7c3aed"
        />
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-title">Proximas citas</h3>
        {appointments?.items?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.items.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : `#${a.patientId}`}</td>
                  <td>{a.service?.name ?? `#${a.serviceId}`}</td>
                  <td>{new Date(a.slotStart).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted" style={{ padding: 16 }}>No hay citas pendientes</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}14`, color }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
