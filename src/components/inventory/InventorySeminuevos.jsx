import React, { useState } from 'react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const TC_LABEL = {
  INT: { label: 'Intercambio / Retoma', color: '#c084fc', icon: '🔄' },
  USA: { label: 'Importado USA',         color: '#38bdf8', icon: '🇺🇸' },
  ODF: { label: 'Otro / Demo',           color: '#94a3b8', icon: '🏷️' },
  PV3: { label: 'Compra Normal (en PEUELA)', color: '#4ade80', icon: '📦' },
  P4V: { label: 'Compra P4V',           color: '#4ade80', icon: '📦' },
  PV6: { label: 'Compra PV6',           color: '#4ade80', icon: '📦' },
};

export default function InventorySeminuevos({ data }) {
  const { used_agency_stats, vehicles_used, summary } = data;
  const [filterAgency, setFilterAgency] = useState('TODAS');

  const agencies = ['TODAS', ...data.agencies];

  const filtered = vehicles_used
    .filter(v => filterAgency === 'TODAS' || v.agency === filterAgency)
    .sort((a, b) => b.dias - a.dias);

  const totalValue = filtered.reduce((s, v) => s + v.ctototal, 0);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(192,132,252,0.12) 0%, rgba(56,189,248,0.08) 100%)',
        border: '1px solid rgba(192,132,252,0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ color: '#c084fc', fontWeight: '900', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
          🔄 Seminuevos e Intercambios — Inventario de Unidades Usadas
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginBottom: '1rem', maxWidth: '700px' }}>
          Vehículos clasificados como <strong style={{ color: '#c084fc' }}>seminuevos o de intercambio</strong> basados en el tipo de compra 
          (<code style={{ color: '#38bdf8' }}>INT</code>, <code style={{ color: '#38bdf8' }}>USA</code>, <code style={{ color: '#38bdf8' }}>ODF</code>) 
          o ubicación en PEUELA con modelo año ≤ 2024. Estos siguen reglas distintas a los 0 km respecto a servicios y garantías.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { icon: '🔄', label: 'Total Seminuevos / Intercambio', val: summary.total_used, color: '#c084fc' },
            { icon: '💰', label: 'Valor Total Flota Usada', val: `$${(filtered.reduce((s,v)=>s+v.ctototal,0)/1000000).toFixed(2)}M`, color: '#38bdf8', isText: true },
            { icon: '📅', label: 'Unidades con +90 días en stock', val: filtered.filter(v => v.dias > 90).length, color: '#f97316' },
          ].map((k, i) => (
            <div key={i} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 'var(--radius-md)', padding: '1rem', border: `1px solid ${k.color}44`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{k.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: k.color }}>{k.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agency summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {used_agency_stats.filter(a => a.total > 0).map((ag, i) => (
          <div
            key={i}
            className="section-card"
            style={{ cursor: 'pointer', borderLeft: '4px solid #c084fc' }}
            onClick={() => setFilterAgency(filterAgency === ag.agency ? 'TODAS' : ag.agency)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>📍 {ag.agency}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {ag.total} unidades · prom. {ag.avg_days}d · max {ag.max_days}d
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#c084fc' }}>{ag.total}</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Valor: </span>
              <span style={{ color: '#38bdf8', fontWeight: '700' }}>${(ag.total_value/1000000).toFixed(2)}M MXN</span>
            </div>
            {ag.total > 0 && (
              <div style={{ marginTop: '0.4rem', height: '6px', borderRadius: '3px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ag.avg_days / 300 * 100)}%`, height: '100%', background: ag.avg_days > 90 ? '#f97316' : '#4ade80', borderRadius: '3px' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AGENCIA:</span>
        {agencies.map(ag => (
          <button key={ag} onClick={() => setFilterAgency(ag)} style={{
            padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer',
            border: `1px solid ${filterAgency === ag ? '#c084fc' : 'var(--border-color)'}`,
            background: filterAgency === ag ? '#c084fc' : 'transparent',
            color: filterAgency === ag ? '#000' : 'var(--text-secondary)',
            fontWeight: filterAgency === ag ? '700' : '400',
          }}>{ag}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#38bdf8', fontWeight: '700' }}>
          {filtered.length} unidades · Valor: ${(totalValue/1000000).toFixed(2)}M MXN
        </span>
      </div>

      {/* Table */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2 }}>
              <tr>
                {['#', 'Agencia', 'Tipo Compra', 'Días Inv.', 'Modelo / Vehículo', 'Año', 'Color', 'No. Serie', 'Ubicación', 'Valor (MXN)', 'Obs.'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.72rem', borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const tc = TC_LABEL[v.tipocompra] || { label: v.tipocompra, color: '#94a3b8', icon: '📋' };
                const isOld = v.dias > 90;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{i + 1}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: '#c084fc', whiteSpace: 'nowrap' }}>📍 {v.agency}</td>
                    <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '99px', background: `${tc.color}22`, color: tc.color, fontWeight: '700', fontSize: '0.72rem' }}>
                        {tc.icon} {tc.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '900', color: isOld ? '#f97316' : '#4ade80', fontSize: '0.9rem' }}>
                      {v.dias}d {isOld && '⚠️'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>{v.caract}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: '#38bdf8', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
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
