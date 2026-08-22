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
      {/* Apple Content-First Inventory Hero Banner */}
      <div className="apple-hero-banner">
        <div className="apple-hero-top">
          <div className="apple-primary-metric">
            <div className="apple-metric-tag">
              <span>🚗</span> CONTROL ESTRATÉGICO DE INVENTARIO DE UNIDADES
            </div>
            <div className="apple-primary-val-row">
              <span className="apple-primary-val">{fmtInt(summary.total_vehicles)}</span>
              <span className="apple-primary-label">Vehículos en Stock</span>
              <span className="apple-status-pill warning">
                ⚠️ {summary.pct_pending}% Alerta de Servicio ({fmtInt(summary.total_pending)} unidades)
              </span>
            </div>
            <p className="apple-primary-sub">
              Valor Total Flota 0km: <strong>${fmt(summary.total_fleet_value)} MXN</strong> ({fmtInt(summary.total_new)} vehículos nuevos · {fmtInt(summary.total_used)} seminuevos).
            </p>
          </div>
        </div>

        <div className="apple-divider-h"></div>

        <div className="apple-metrics-grid">
          <div className="apple-metric-col">
            <span className="apple-col-title">Valor Flota Nuevos</span>
            <span className="apple-col-val" style={{ color: 'var(--text-primary)' }}>
              ${fmt(summary.total_fleet_value)}
            </span>
            <span className="apple-col-desc">Inversión activa en vehículos 0 km en grupo.</span>
          </div>

          <div className="apple-metric-col">
            <span className="apple-col-title">Servicio Pendiente (+90d)</span>
            <span className="apple-col-val" style={{ color: '#e11d48' }}>
              {fmtInt(summary.total_pending)}
            </span>
            <span className="apple-col-desc">Unidades que requieren mantenimiento a cargo de agencia.</span>
          </div>

          <div className="apple-metric-col">
            <span className="apple-col-title">Costo Estimado Mantenimiento</span>
            <span className="apple-col-val" style={{ color: '#d97706' }}>
              ${fmt(summary.total_svc_cost_est)}
            </span>
            <span className="apple-col-desc">Costo total absorbido por la casa distribuidora.</span>
          </div>

          <div className="apple-metric-col">
            <span className="apple-col-title">Promedio Días en Stock</span>
            <span className="apple-col-val" style={{ color: summary.avg_days > 90 ? '#e11d48' : '#059669' }}>
              {summary.avg_days} <span style={{ fontSize: '1rem', fontWeight: '600' }}>días</span>
            </span>
            <span className="apple-col-desc">Máximo histórico registrado: {fmtInt(summary.max_days)} días.</span>
          </div>
        </div>
      </div>

      {/* Service breakdown bar */}
      <div className="section-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1.1rem' }}>
          📊 Distribución del Estado del Inventario Nuevo (0 km) — {fmtInt(summary.total_new)} unidades
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: '✅ En Regla', desc: 'Menos de 90 días', count: summary.total_ok, color: '#059669', bg: '#ecfdf5', pct: Math.round(100 * summary.total_ok / summary.total_new) },
            { label: '⚠️ 1er Servicio', desc: '90–179 días / 5,000 km', count: summary.total_svc1, color: '#d97706', bg: '#fffbeb', pct: Math.round(100 * summary.total_svc1 / summary.total_new) },
            { label: '🔴 2do Servicio', desc: '180–269 días / 10,000 km', count: summary.total_svc2, color: '#ea580c', bg: '#fff7ed', pct: Math.round(100 * summary.total_svc2 / summary.total_new) },
            { label: '🚨 3er Servicio', desc: '270+ días / 15,000 km', count: summary.total_svc3, color: '#e11d48', bg: '#fef2f2', pct: Math.round(100 * summary.total_svc3 / summary.total_new) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.1rem 1rem', background: s.bg, borderRadius: 'var(--radius-md)', border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{fmtInt(s.count)}</div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem', marginTop: '0.4rem', marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.desc}</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: s.color }}>{s.pct}%</div>
            </div>
          ))}
        </div>
        {/* Visual stacked bar */}
        <div style={{ height: '14px', borderRadius: '99px', overflow: 'hidden', display: 'flex', marginBottom: '0.6rem', background: '#f1f5f9' }}>
          {[
            { count: summary.total_ok,   color: '#059669' },
            { count: summary.total_svc1, color: '#d97706' },
            { count: summary.total_svc2, color: '#ea580c' },
            { count: summary.total_svc3, color: '#e11d48' },
          ].map((s, i) => (
            <div key={i} style={{ flex: s.count, background: s.color, transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Representación proporcional del estado de la flota
        </div>
      </div>

      {/* Two column row: Family + Agency summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Vehicle Family Distribution */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🚘 Distribución por Modelo (Flota Nueva)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {family_distribution.slice(0, 10).map((f, i) => {
              const pct = Math.round(100 * f.count / summary.total_new);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '110px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', flexShrink: 0 }}>{f.family}</div>
                  <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: '99px' }} />
                  </div>
                  <div style={{ width: '45px', textAlign: 'right', fontSize: '0.8rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{f.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agency Risk Summary */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🏢 Riesgo por Agencia — Vehículos con Servicio Pendiente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[...agency_stats]
              .sort((a, b) => b.pending_services - a.pending_services)
              .map((ag, i) => {
                const pct = ag.total > 0 ? Math.round(100 * ag.pending_services / ag.total) : 0;
                const color = pct >= 60 ? '#e11d48' : pct >= 40 ? '#ea580c' : pct >= 20 ? '#d97706' : '#059669';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '100px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', flexShrink: 0 }}>{ag.agency}</div>
                    <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color, width: '55px', textAlign: 'right' }}>
                      {ag.pending_services}/{ag.total}
                    </div>
                  </div>
                );
            })}
          </div>
          <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            Ratio de unidades con &gt;90 días en stock por sucursal
          </div>
        </div>
      </div>

      {/* Cost alert box */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(225, 29, 72, 0.2)',
        borderLeft: '4px solid #e11d48',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h3 style={{ color: '#e11d48', fontWeight: '800', marginBottom: '1rem', fontSize: '1.1rem' }}>
          🚨 Impacto Financiero — Costo de Servicios a Cargo de la Casa
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: '1er Servicio (×' + summary.total_svc1 + ' unidades)', cost: summary.total_svc1 * 650, icon: '⚠️' },
            { label: '2do Servicio (×' + summary.total_svc2 + ' unidades)', cost: summary.total_svc2 * 1100, icon: '🔴' },
            { label: '3er Servicio (×' + summary.total_svc3 + ' unidades)', cost: summary.total_svc3 * 1500, icon: '🚨' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.1rem 1rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid rgba(225, 29, 72, 0.15)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#e11d48' }}>${s.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total estimado a cargo de la casa: </span>
          <span style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#e11d48', marginLeft: '0.5rem' }}>
            ${fmt(summary.total_svc_cost_est)} MXN
          </span>
        </div>
      </div>
    </div>
  );
}
