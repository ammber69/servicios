import React, { useState } from 'react';
import { Building2, MapPin, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, X } from 'lucide-react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const SVC_CONFIG = {
  OK:        { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'En Regla', short: 'OK' },
  SVC_1_5K:  { color: '#b45309', bg: '#fffbeb', border: '#fef08a', label: '1er Svc (5K)', short: '5K' },
  SVC_2_10K: { color: '#c2410c', bg: '#fff7ed', border: '#ffedd5', label: '2do Svc (10K)', short: '10K' },
  SVC_3_15K: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: '3er Svc (15K)', short: '15K' },
};

export default function InventoryByAgency({ data }) {
  const { agency_stats } = data;
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyFilter, setAgencyFilter] = useState('ALL');

  const selected = agency_stats.find(a => a.agency === selectedAgency);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Building2 size={22} color="var(--text-primary)" />
        <h2 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
          Inventario de Unidades Nuevas (0 km) por Agencia
        </h2>
      </div>

      {/* Agency Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {agency_stats.map((ag, i) => {
          const isSelected = selectedAgency === ag.agency;
          const pctPending = ag.total > 0 ? Math.round(100 * ag.pending_services / ag.total) : 0;
          const riskColor = pctPending >= 60 ? '#b91c1c' : pctPending >= 40 ? '#c2410c' : pctPending >= 20 ? '#b45309' : '#15803d';

          return (
            <div
              key={i}
              className="section-card"
              style={{
                cursor: 'pointer',
                border: isSelected ? `2px solid var(--nissan-red)` : '1px solid var(--border-subtle)',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.2s ease',
                background: '#ffffff'
              }}
              onClick={() => setSelectedAgency(isSelected ? null : ag.agency)}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} color="var(--nissan-red)" />
                    <span>{ag.agency}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {ag.total} unidades · promedio {ag.avg_days} días
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '99px',
                  background: `${riskColor}12`,
                  border: `1px solid ${riskColor}33`,
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
                  { key: 'ok',   label: 'OK',    val: ag.ok,   color: '#15803d', bg: '#f0fdf4' },
                  { key: 'svc1', label: '5K',   val: ag.svc1, color: '#b45309', bg: '#fffbeb' },
                  { key: 'svc2', label: '10K',  val: ag.svc2, color: '#c2410c', bg: '#fff7ed' },
                  { key: 'svc3', label: '15K',  val: ag.svc3, color: '#b91c1c', bg: '#fef2f2' },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: 'center', padding: '0.4rem', background: s.bg, borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '700', color: s.color }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.75rem', background: '#f1f5f9' }}>
                {[
                  { val: ag.ok,   color: '#15803d' },
                  { val: ag.svc1, color: '#b45309' },
                  { val: ag.svc2, color: '#c2410c' },
                  { val: ag.svc3, color: '#b91c1c' },
                ].map((s, j) => (
                  <div key={j} style={{ flex: s.val || 0, background: s.color }} />
                ))}
              </div>

              {/* Cost and value */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Valor flota: </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${(ag.total_value/1000000).toFixed(1)}M</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Costo svc: </span>
                  <span style={{ fontWeight: '700', color: '#d97706' }}>${fmt(ag.total_svc_cost)}</span>
                </div>
              </div>

              {isSelected && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--nissan-red)', fontWeight: '700', textAlign: 'center' }}>
                  Seleccionado · Click para ocultar detalle
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel for selected agency */}
      {selected && (
        <div className="section-card" style={{ border: '2px solid var(--nissan-red)', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: '800', color: 'var(--nissan-red)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} />
              <span>Detalle de Agencia: {selected.agency} · {selected.total} unidades</span>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {['ALL', 'OK', 'SVC_1_5K', 'SVC_2_10K', 'SVC_3_15K'].map(f => (
                <button
                  key={f}
                  onClick={() => setAgencyFilter(f)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '99px',
                    border: `1px solid ${agencyFilter === f ? 'var(--nissan-red)' : 'var(--border-subtle)'}`,
                    background: agencyFilter === f ? 'var(--nissan-red)' : '#ffffff',
                    color: agencyFilter === f ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {f === 'ALL' ? 'Todos' : SVC_CONFIG[f]?.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedAgency(null)}
                style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', border: '1px solid var(--border-subtle)', background: '#ffffff', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <X size={14} />
                <span>Cerrar</span>
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '460px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 2 }}>
                <tr>
                  {['Estado', 'Días', 'Modelo / Característica', 'Año', 'Color', 'Serie', 'Ubicación', 'Valor MXN', 'Costo Svc Est.'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', borderBottom: '2px solid var(--border-subtle)', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '0.72rem' }}>{h}</th>
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
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)' }}>
                        <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: '700', fontSize: '0.72rem' }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: cfg.color }}>{v.dias}d</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-primary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.caract}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.color}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{v.numser}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.ubicacion}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: v.svc_cost_est > 0 ? '#d97706' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {v.svc_cost_est > 0 ? `$${fmt(v.svc_cost_est)}` : 'N/A'}
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
