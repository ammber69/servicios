import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, MapPin, Clock, DollarSign } from 'lucide-react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const SVC_CONFIG = {
  SVC_1_5K:  { color: '#b45309', bg: '#fffbeb', border: '#fef08a', icon: AlertTriangle, label: '1er Servicio · 5,000 km',  dias: '90 a 179 días', cost: 650 },
  SVC_2_10K: { color: '#c2410c', bg: '#fff7ed', border: '#ffedd5', icon: AlertCircle, label: '2do Servicio · 10,000 km', dias: '180 a 269 días', cost: 1100 },
  SVC_3_15K: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: ShieldAlert, label: '3er Servicio · 15,000 km', dias: '270+ días',    cost: 1500 },
};

export default function InventoryServiceAlert({ data }) {
  const { over90_vehicles, summary } = data;
  const [filterAgency, setFilterAgency] = useState('TODAS');
  const [filterSvc, setFilterSvc] = useState('TODAS');
  const [sortBy, setSortBy] = useState('dias');

  const agencies = ['TODAS', ...data.agencies];
  const svcTypes = ['TODAS', 'SVC_1_5K', 'SVC_2_10K', 'SVC_3_15K'];

  const filtered = over90_vehicles
    .filter(v => filterAgency === 'TODAS' || v.agency === filterAgency)
    .filter(v => filterSvc === 'TODAS' || v.svc_category === filterSvc)
    .sort((a, b) => sortBy === 'dias' ? b.dias - a.dias : b.ctototal - a.ctototal);

  const totalCostFiltered = filtered.reduce((s, v) => s + v.svc_cost_est, 0);

  return (
    <div>
      {/* Alert Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fecaca',
        borderLeft: '4px solid #dc2626',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={22} color="#dc2626" />
          <h2 style={{ color: '#dc2626', fontWeight: '800', fontSize: '1.3rem' }}>
            Alerta de Servicio: Vehículos con Más de 90 Días en Inventario
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem', maxWidth: '750px', lineHeight: '1.4' }}>
          La normativa Nissan establece que el primer servicio de mantenimiento ocurre a los <strong style={{ color: '#b45309' }}>90 días ó 5,000 km</strong> (lo que ocurra primero). Cuando un vehículo nuevo supera este umbral sin venderse, <strong style={{ color: '#dc2626' }}>el costo del servicio corre a cargo de la agencia</strong> distribuidora.
        </p>

        {/* 3 KPI boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {Object.entries(SVC_CONFIG).map(([key, cfg]) => {
            const count = summary[key === 'SVC_1_5K' ? 'total_svc1' : key === 'SVC_2_10K' ? 'total_svc2' : 'total_svc3'];
            const IconComp = cfg.icon;
            return (
              <div key={key} style={{ background: cfg.bg, borderRadius: 'var(--radius-md)', padding: '1rem', border: `1px solid ${cfg.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <IconComp size={20} color={cfg.color} />
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: cfg.color }}>{cfg.dias}</span>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: '800', color: cfg.color, marginTop: '0.2rem' }}>{count}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cfg.label}</div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#d97706', fontWeight: '700' }}>
                  Est. ${(count * cfg.cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a cargo de agencia
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AGENCIA:</span>
          {agencies.map(ag => (
            <button key={ag} onClick={() => setFilterAgency(ag)} style={{
              padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600',
              border: `1px solid ${filterAgency === ag ? 'var(--nissan-red)' : 'var(--border-subtle)'}`,
              background: filterAgency === ag ? 'var(--nissan-red)' : '#ffffff',
              color: filterAgency === ag ? '#ffffff' : 'var(--text-secondary)',
            }}>{ag}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>SERVICIO:</span>
          {svcTypes.map(s => {
            const cfg = SVC_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterSvc(s)} style={{
                padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer',
                border: `1px solid ${filterSvc === s ? 'var(--nissan-red)' : 'var(--border-subtle)'}`,
                background: filterSvc === s ? 'var(--nissan-red)' : '#ffffff',
                color: filterSvc === s ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: filterSvc === s ? '700' : '400',
              }}>{s === 'TODAS' ? 'Todos' : cfg.label}</button>
            );
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>ORDENAR:</span>
          <button onClick={() => setSortBy('dias')} style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', border: `1px solid ${sortBy === 'dias' ? 'var(--nissan-red)' : 'var(--border-subtle)'}`, background: sortBy === 'dias' ? 'var(--nissan-red)' : '#ffffff', color: sortBy === 'dias' ? '#ffffff' : 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} />
            <span>Días</span>
          </button>
          <button onClick={() => setSortBy('valor')} style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', border: `1px solid ${sortBy === 'valor' ? 'var(--nissan-red)' : 'var(--border-subtle)'}`, background: sortBy === 'valor' ? 'var(--nissan-red)' : '#ffffff', color: sortBy === 'valor' ? '#ffffff' : 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <DollarSign size={13} />
            <span>Valor</span>
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.6rem 0.85rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Mostrando <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> vehículos con servicio pendiente
        </span>
        <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '800' }}>
          Costo estimado filtrado: ${fmt(totalCostFiltered)} MXN
        </span>
      </div>

      {/* Table */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto', maxHeight: '560px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 2 }}>
              <tr>
                {['#', 'Agencia', 'Estado / Servicio', 'Días en Inv.', 'Modelo / Vehículo', 'Año', 'Color', 'No. Serie', 'Ubicación Física', 'Valor (MXN)', 'Costo Svc Est.', 'Obs.'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.72rem', borderBottom: '2px solid var(--border-subtle)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const cfg = SVC_CONFIG[v.svc_category] || SVC_CONFIG.SVC_1_5K;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)' }}>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{i + 1}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v.agency}</td>
                    <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', background: cfg.bg, color: cfg.color, fontWeight: '700', fontSize: '0.72rem', border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: cfg.color, fontSize: '0.88rem' }}>
                      {v.dias}d
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>{v.caract}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: '#d97706', whiteSpace: 'nowrap' }}>
                      ${fmt(v.svc_cost_est)}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem' }} title={v.obs}>
                      {v.obs || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
