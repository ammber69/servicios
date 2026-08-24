import React, { useState } from 'react';
import { RefreshCw, DollarSign, Calendar, MapPin, AlertTriangle, Tag, Package } from 'lucide-react';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';

const TC_LABEL = {
  INT: { label: 'Intercambio / Retoma', color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff' },
  USA: { label: 'Importado USA',         color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  ODF: { label: 'Otro / Demo',           color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  PV3: { label: 'Compra Normal (PEÑUELA)', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  P4V: { label: 'Compra P4V',           color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  PV6: { label: 'Compra PV6',           color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
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
        background: '#ffffff',
        border: '1px solid #e9d5ff',
        borderLeft: '4px solid #9333ea',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <RefreshCw size={22} color="#9333ea" />
          <h2 style={{ color: '#6b21a8', fontWeight: '800', fontSize: '1.3rem' }}>
            Seminuevos e Intercambios · Inventario de Unidades Usadas
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem', maxWidth: '750px', lineHeight: '1.4' }}>
          Vehículos clasificados como <strong style={{ color: '#6b21a8' }}>seminuevos o de intercambio</strong> basados en el tipo de compra (<code style={{ color: '#0369a1' }}>INT</code>, <code style={{ color: '#0369a1' }}>USA</code>, <code style={{ color: '#0369a1' }}>ODF</code>) o ubicación en PEÑUELA con modelo año ≤ 2024. Estos siguen reglas distintas a los 0 km respecto a servicios y garantías.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: RefreshCw, label: 'Total Seminuevos / Intercambio', val: summary.total_used, color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff' },
            { icon: DollarSign, label: 'Valor Total Flota Usada', val: `$${(filtered.reduce((s,v)=>s+v.ctototal,0)/1000000).toFixed(2)}M`, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
            { icon: Calendar, label: 'Unidades con +90 días en stock', val: filtered.filter(v => v.dias > 90).length, color: '#b45309', bg: '#fffbeb', border: '#fef08a' },
          ].map((k, i) => {
            const IconComp = k.icon;
            return (
              <div key={i} style={{ background: k.bg, borderRadius: 'var(--radius-md)', padding: '1rem', border: `1px solid ${k.border}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
                  <IconComp size={20} color={k.color} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: k.color }}>{k.val}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{k.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agency summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {used_agency_stats.filter(a => a.total > 0).map((ag, i) => (
          <div
            key={i}
            className="section-card"
            style={{ cursor: 'pointer', borderLeft: '4px solid #9333ea', background: '#ffffff' }}
            onClick={() => setFilterAgency(filterAgency === ag.agency ? 'TODAS' : ag.agency)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="var(--nissan-red)" />
                  <span>{ag.agency}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {ag.total} unidades · prom. {ag.avg_days}d · max {ag.max_days}d
                </div>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6b21a8' }}>{ag.total}</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Valor: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>${(ag.total_value/1000000).toFixed(2)}M MXN</span>
            </div>
            {ag.total > 0 && (
              <div style={{ marginTop: '0.4rem', height: '6px', borderRadius: '3px', background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ag.avg_days / 300 * 100)}%`, height: '100%', background: ag.avg_days > 90 ? '#d97706' : '#15803d', borderRadius: '3px' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AGENCIA:</span>
        {agencies.map(ag => (
          <button key={ag} onClick={() => setFilterAgency(ag)} style={{
            padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600',
            border: `1px solid ${filterAgency === ag ? 'var(--nissan-red)' : 'var(--border-subtle)'}`,
            background: filterAgency === ag ? 'var(--nissan-red)' : '#ffffff',
            color: filterAgency === ag ? '#ffffff' : 'var(--text-secondary)',
          }}>{ag}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '800' }}>
          {filtered.length} unidades · Valor: ${(totalValue/1000000).toFixed(2)}M MXN
        </span>
      </div>

      {/* Table */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 2 }}>
              <tr>
                {['#', 'Agencia', 'Tipo Compra', 'Días Inv.', 'Modelo / Vehículo', 'Año', 'Color', 'No. Serie', 'Ubicación', 'Valor (MXN)', 'Obs.'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.72rem', borderBottom: '2px solid var(--border-subtle)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const tc = TC_LABEL[v.tipocompra] || { label: v.tipocompra, color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
                const isOld = v.dias > 90;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)' }}>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{i + 1}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v.agency}</td>
                    <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontWeight: '700', fontSize: '0.72rem' }}>
                        {tc.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: isOld ? '#d97706' : '#15803d', fontSize: '0.88rem' }}>
                      {v.dias}d
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>{v.caract}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
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
