import React, { useState } from 'react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const SVC_CONFIG = {
  OK:        { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  icon: '✅', short: 'OK' },
  SVC_1_5K:  { color: '#facc15', bg: 'rgba(250,204,21,0.1)', icon: '⚠️', short: '5K' },
  SVC_2_10K: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: '🔴', short: '10K' },
  SVC_3_15K: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: '🚨', short: '15K' },
};

export default function InventoryByAgency({ data }) {
  const { agency_stats } = data;
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyFilter, setAgencyFilter] = useState('ALL');

  const selected = agency_stats.find(a => a.agency === selectedAgency);

  return (
    <div>
      <h2 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
        🏢 Inventario de Unidades Nuevas (0 km) por Agencia
      </h2>

      {/* Agency Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {agency_stats.map((ag, i) => {
          const isSelected = selectedAgency === ag.agency;
          const pctPending = ag.total > 0 ? Math.round(100 * ag.pending_services / ag.total) : 0;
          const riskColor = pctPending >= 60 ? '#ef4444' : pctPending >= 40 ? '#f97316' : pctPending >= 20 ? '#facc15' : '#4ade80';

          return (
            <div
              key={i}
              className="section-card"
              style={{
                cursor: 'pointer',
                border: isSelected ? `2px solid var(--nissan-red)` : '1px solid var(--border-glass)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setSelectedAgency(isSelected ? null : ag.agency)}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-primary)' }}>📍 {ag.agency}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {ag.total} unidades · prom. {ag.avg_days} días
                  </div>
                </div>
                <div style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: '99px',
                  background: `${riskColor}22`,
                  border: `1px solid ${riskColor}66`,
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: riskColor,
                }}>
                  {pctPending}% riesgo
                </div>
              </div>

              {/* Status breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {[
                  { key: 'ok',   label: '✅ OK',    val: ag.ok,   color: '#4ade80' },
                  { key: 'svc1', label: '⚠️ 5K',   val: ag.svc1, color: '#facc15' },
                  { key: 'svc2', label: '🔴 10K',  val: ag.svc2, color: '#f97316' },
                  { key: 'svc3', label: '🚨 15K',  val: ag.svc3, color: '#ef4444' },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: 'center', padding: '0.4rem', background: `${s.color}11`, borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.75rem' }}>
                {[
                  { val: ag.ok,   color: '#4ade80' },
                  { val: ag.svc1, color: '#facc15' },
                  { val: ag.svc2, color: '#f97316' },
                  { val: ag.svc3, color: '#ef4444' },
                ].map((s, j) => (
                  <div key={j} style={{ flex: s.val || 0, background: s.color }} />
                ))}
              </div>

              {/* Cost and value */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Valor flota: </span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>${(ag.total_value/1000000).toFixed(1)}M</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Costo svc: </span>
                  <span style={{ fontWeight: '700', color: '#f59e0b' }}>${fmt(ag.total_svc_cost)}</span>
                </div>
              </div>

              {isSelected && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--accent-blue)', textAlign: 'center' }}>
                  👆 Click para ver detalle ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel for selected agency */}
      {selected && (
        <div className="section-card" style={{ border: '2px solid var(--nissan-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: '800', color: 'var(--nissan-red)', fontSize: '1.2rem' }}>
              📍 Detalle: {selected.agency} — {selected.total} unidades
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'OK', 'SVC_1_5K', 'SVC_2_10K', 'SVC_3_15K'].map(f => (
                <button
                  key={f}
                  onClick={() => setAgencyFilter(f)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '99px',
                    border: `1px solid ${agencyFilter === f ? 'var(--nissan-red)' : 'var(--border-color)'}`,
                    background: agencyFilter === f ? 'var(--nissan-red)' : 'transparent',
                    color: agencyFilter === f ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {f === 'ALL' ? 'Todos' : SVC_CONFIG[f]?.icon + ' ' + SVC_CONFIG[f]?.short}
                </button>
              ))}
              <button
                onClick={() => setSelectedAgency(null)}
                style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2 }}>
                <tr>
                  {['Estado', 'Días', 'Modelo / Característica', 'Año', 'Color', 'Serie', 'Ubicación', 'Valor MXN', 'Costo Svc Est.'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.vehicles
                  .filter(v => agencyFilter === 'ALL' || v.svc_category === agencyFilter)
                  .sort((a, b) => b.dias - a.dias)
                  .map((v, i) => {
                    const cfg = SVC_CONFIG[v.svc_category] || SVC_CONFIG.OK;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '99px', background: cfg.bg, color: cfg.color, fontWeight: '700', fontSize: '0.72rem' }}>
                            {cfg.icon} {v.svc_category === 'OK' ? 'En regla' : v.svc_category.replace('SVC_', '').replace('_', ' / ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '800', color: cfg.color }}>{v.dias}d</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.caract}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.color}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{v.numser}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.ubicacion}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: v.svc_cost_est > 0 ? '#f59e0b' : '#4ade80', whiteSpace: 'nowrap' }}>
                          {v.svc_cost_est > 0 ? `$${fmt(v.svc_cost_est)}` : '—'}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
