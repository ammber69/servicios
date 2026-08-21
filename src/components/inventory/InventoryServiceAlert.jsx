import React, { useState } from 'react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const SVC_CONFIG = {
  SVC_1_5K:  { color: '#facc15', bg: 'rgba(250,204,21,0.12)',  icon: '⚠️', label: '1er Servicio — 5,000 km',  dias: '90–179 días', cost: 650 },
  SVC_2_10K: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🔴', label: '2do Servicio — 10,000 km', dias: '180–269 días', cost: 1100 },
  SVC_3_15K: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '🚨', label: '3er Servicio — 15,000 km', dias: '270+ días',    cost: 1500 },
};

export default function InventoryServiceAlert({ data }) {
  const { over90_vehicles, summary, agency_stats } = data;
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
      {/* Alert Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.1) 100%)',
        border: '1px solid rgba(239,68,68,0.5)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ color: '#ef4444', fontWeight: '900', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
          🚨 Alerta: Vehículos con Más de 90 Días en Inventario
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', maxWidth: '700px' }}>
          La normativa Nissan establece que el primer servicio de mantenimiento ocurre a los <strong style={{ color: '#facc15' }}>90 días ó 5,000 km</strong> — 
          lo que ocurra primero. Cuando un vehículo nuevo supera este umbral sin venderse, 
          <strong style={{ color: '#ef4444' }}> el costo del servicio corre a cargo de la agencia</strong>, no del cliente final.
        </p>

        {/* 3 KPI boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {Object.entries(SVC_CONFIG).map(([key, cfg]) => {
            const count = summary[key === 'SVC_1_5K' ? 'total_svc1' : key === 'SVC_2_10K' ? 'total_svc2' : 'total_svc3'];
            return (
              <div key={key} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 'var(--radius-md)', padding: '1rem', border: `1px solid ${cfg.color}44` }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{cfg.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: cfg.color }}>{count}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cfg.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{cfg.dias}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>
                  Est. ${(count * cfg.cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a cargo de la casa
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AGENCIA:</span>
          {agencies.map(ag => (
            <button key={ag} onClick={() => setFilterAgency(ag)} style={{
              padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer',
              border: `1px solid ${filterAgency === ag ? 'var(--nissan-red)' : 'var(--border-color)'}`,
              background: filterAgency === ag ? 'var(--nissan-red)' : 'transparent',
              color: filterAgency === ag ? '#fff' : 'var(--text-secondary)',
            }}>{ag}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>SERVICIO:</span>
          {svcTypes.map(s => {
            const cfg = SVC_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterSvc(s)} style={{
                padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer',
                border: `1px solid ${filterSvc === s ? (cfg?.color || 'var(--accent-blue)') : 'var(--border-color)'}`,
                background: filterSvc === s ? (cfg?.color || 'var(--accent-blue)') : 'transparent',
                color: filterSvc === s ? '#000' : 'var(--text-secondary)',
                fontWeight: filterSvc === s ? '700' : '400',
              }}>{s === 'TODAS' ? 'Todos' : `${cfg.icon} ${cfg.label.split('—')[0].trim()}`}</button>
            );
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ORDENAR:</span>
          <button onClick={() => setSortBy('dias')} style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', border: `1px solid ${sortBy === 'dias' ? 'var(--accent-blue)' : 'var(--border-color)'}`, background: sortBy === 'dias' ? 'var(--accent-blue)' : 'transparent', color: sortBy === 'dias' ? '#fff' : 'var(--text-secondary)' }}>⏱ Días</button>
          <button onClick={() => setSortBy('valor')} style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', border: `1px solid ${sortBy === 'valor' ? 'var(--accent-blue)' : 'var(--border-color)'}`, background: sortBy === 'valor' ? 'var(--accent-blue)' : 'transparent', color: sortBy === 'valor' ? '#fff' : 'var(--text-secondary)' }}>💰 Valor</button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Mostrando <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> vehículos
        </span>
        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>
          Costo estimado filtrado: ${fmt(totalCostFiltered)} MXN
        </span>
      </div>

      {/* Table */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '560px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2 }}>
              <tr>
                {['#', 'Agencia', 'Estado / Servicio', 'Días en Inv.', 'Modelo / Vehículo', 'Año', 'Color', 'No. Serie', 'Ubicación Física', 'Valor (MXN)', 'Costo Svc Est.', 'Obs.'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.72rem', borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const cfg = SVC_CONFIG[v.svc_category];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{i + 1}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>📍 {v.agency}</td>
                    <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '99px', background: cfg.bg, color: cfg.color, fontWeight: '800', fontSize: '0.72rem', border: `1px solid ${cfg.color}44` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '900', color: cfg.color, fontSize: '0.9rem' }}>
                      {v.dias}d
                      {v.dias > 180 && <span style={{ marginLeft: '4px', fontSize: '0.65rem', opacity: 0.7 }}>⚡</span>}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>{v.caract}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '900', color: '#f59e0b', whiteSpace: 'nowrap' }}>
                      ${fmt(v.svc_cost_est)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem' }} title={v.obs}>
                      {v.obs || '—'}
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
