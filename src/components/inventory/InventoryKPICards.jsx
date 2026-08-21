import React from 'react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';
const fmtInt = (n) => n?.toLocaleString('es-MX') ?? '0';

export default function InventoryKPICards({ data }) {
  const { summary, family_distribution, agency_stats } = data;

  const kpis = [
    {
      icon: '🚗',
      label: 'Total Unidades en Inventario',
      value: fmtInt(summary.total_vehicles),
      sub: `${fmtInt(summary.total_new)} nuevas · ${fmtInt(summary.total_used)} seminuevos`,
      color: 'var(--accent-blue)',
    },
    {
      icon: '💰',
      label: 'Valor Flota Nuevos (0 km)',
      value: `$${fmt(summary.total_fleet_value)}`,
      sub: 'MXN en inventario activo',
      color: 'var(--accent-cyan)',
    },
    {
      icon: '⚠️',
      label: 'Unidades con Servicio Pendiente',
      value: fmtInt(summary.total_pending),
      sub: `${summary.pct_pending}% del inventario nuevo ya superó los 90 días`,
      color: 'var(--nissan-red)',
    },
    {
      icon: '💸',
      label: 'Costo Estimado a Cargo de la Casa',
      value: `$${fmt(summary.total_svc_cost_est)}`,
      sub: 'Servicios que paga la agencia (no el cliente)',
      color: '#f59e0b',
    },
    {
      icon: '📅',
      label: 'Promedio de Días en Inventario',
      value: `${summary.avg_days} días`,
      sub: `Máximo registrado: ${fmtInt(summary.max_days)} días`,
      color: summary.avg_days > 90 ? 'var(--nissan-red)' : '#4ade80',
    },
    {
      icon: '🚨',
      label: 'Críticos (>180 días)',
      value: fmtInt(summary.total_svc2 + summary.total_svc3),
      sub: `2do servicio: ${summary.total_svc2} · 3er servicio: ${summary.total_svc3}`,
      color: '#ef4444',
    },
  ];

  return (
    <div>
      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {kpis.map((k, i) => (
          <div key={i} className="section-card" style={{
            borderLeft: `4px solid ${k.color}`,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem' }}>{k.icon}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: k.color, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Service breakdown bar */}
      <div className="section-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1.1rem' }}>
          📊 Distribución del Estado del Inventario Nuevo (0 km) — {fmtInt(summary.total_new)} unidades
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: '✅ En Regla', desc: 'Menos de 90 días', count: summary.total_ok, color: '#4ade80', pct: Math.round(100 * summary.total_ok / summary.total_new) },
            { label: '⚠️ 1er Servicio', desc: '90–179 días / 5,000 km', count: summary.total_svc1, color: '#facc15', pct: Math.round(100 * summary.total_svc1 / summary.total_new) },
            { label: '🔴 2do Servicio', desc: '180–269 días / 10,000 km', count: summary.total_svc2, color: '#f97316', pct: Math.round(100 * summary.total_svc2 / summary.total_new) },
            { label: '🚨 3er Servicio', desc: '270+ días / 15,000 km', count: summary.total_svc3, color: '#ef4444', pct: Math.round(100 * summary.total_svc3 / summary.total_new) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: `2px solid ${s.color}22` }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color }}>{fmtInt(s.count)}</div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.desc}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color }}>{s.pct}%</div>
            </div>
          ))}
        </div>
        {/* Visual stacked bar */}
        <div style={{ height: '18px', borderRadius: '9px', overflow: 'hidden', display: 'flex', marginBottom: '0.5rem' }}>
          {[
            { count: summary.total_ok,   color: '#4ade80' },
            { count: summary.total_svc1, color: '#facc15' },
            { count: summary.total_svc2, color: '#f97316' },
            { count: summary.total_svc3, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{ flex: s.count, background: s.color, transition: 'flex 0.5s ease' }} />
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Representación proporcional del estado de la flota
        </div>
      </div>

      {/* Two column row: Family + Agency summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Vehicle Family Distribution */}
        <div className="section-card">
          <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🚘 Distribución por Modelo (Flota Nueva)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {family_distribution.slice(0, 10).map((f, i) => {
              const pct = Math.round(100 * f.count / summary.total_new);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '110px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{f.family}</div>
                  <div style={{ flex: 1, height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '5px' }} />
                  </div>
                  <div style={{ width: '45px', textAlign: 'right', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{f.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agency Risk Summary */}
        <div className="section-card">
          <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🏢 Riesgo por Agencia — Vehículos con Servicio Pendiente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[...agency_stats]
              .sort((a, b) => b.pending_services - a.pending_services)
              .map((ag, i) => {
                const pct = ag.total > 0 ? Math.round(100 * ag.pending_services / ag.total) : 0;
                const color = pct >= 60 ? '#ef4444' : pct >= 40 ? '#f97316' : pct >= 20 ? '#facc15' : '#4ade80';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '100px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{ag.agency}</div>
                    <div style={{ flex: 1, height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '5px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color, width: '55px', textAlign: 'right' }}>
                      {ag.pending_services}/{ag.total}
                    </div>
                  </div>
                );
            })}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            Ratio de unidades con &gt;90 días en stock por sucursal
          </div>
        </div>
      </div>

      {/* Cost alert box */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.08) 100%)',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
      }}>
        <h3 style={{ color: '#ef4444', fontWeight: '800', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
          🚨 Impacto Financiero — Costo de Servicios a Cargo de la Casa
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: '1er Servicio (×' + summary.total_svc1 + ' unidades)', cost: summary.total_svc1 * 650, icon: '⚠️' },
            { label: '2do Servicio (×' + summary.total_svc2 + ' unidades)', cost: summary.total_svc2 * 1100, icon: '🔴' },
            { label: '3er Servicio (×' + summary.total_svc3 + ' unidades)', cost: summary.total_svc3 * 1500, icon: '🚨' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(15,23,42,0.4)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#f59e0b' }}>${s.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', borderTop: '1px solid rgba(239,68,68,0.3)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total estimado a cargo de la casa: </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444', marginLeft: '0.5rem' }}>
            ${fmt(summary.total_svc_cost_est)} MXN
          </span>
        </div>
      </div>
    </div>
  );
}
