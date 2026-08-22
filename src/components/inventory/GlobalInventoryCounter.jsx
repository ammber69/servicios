import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const fmt = (n) => n?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) ?? '0.00';
const fmtInt = (n) => n?.toLocaleString('es-MX') ?? '0';

export default function GlobalInventoryCounter({ data }) {
  const { summary, vehicles_new, vehicles_used } = data;
  const [modalType, setModalType] = useState(null); // 'OK', 'OVER90', 'USED', 'ALL'
  const [searchTerm, setSearchTerm] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('TODAS');

  // Prevent background scroll when modal open
  useEffect(() => {
    if (modalType) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [modalType]);

  if (!summary) return null;

  // Prepare filtered list for modal
  let targetVehicles = [];
  let modalTitle = '';
  let modalBadgeColor = 'var(--accent-blue)';

  if (modalType === 'OK') {
    targetVehicles = vehicles_new.filter(v => v.svc_category === 'OK');
    modalTitle = '✅ Vehículos En Regla (< 90 Días en Inventario)';
    modalBadgeColor = '#4ade80';
  } else if (modalType === 'OVER90') {
    targetVehicles = vehicles_new.filter(v => v.svc_category !== 'OK');
    modalTitle = '🚨 Vehículos Con Alerta (≥ 90 Días — Generan Costo de Servicio)';
    modalBadgeColor = '#ef4444';
  } else if (modalType === 'USED') {
    targetVehicles = vehicles_used;
    modalTitle = '🔄 Seminuevos / Vehículos de Intercambio';
    modalBadgeColor = '#c084fc';
  } else if (modalType === 'ALL') {
    targetVehicles = [...vehicles_new, ...vehicles_used];
    modalTitle = '🚗 Inventario Completo del Grupo (867 Unidades)';
    modalBadgeColor = 'var(--accent-cyan)';
  }

  // Apply search & agency filters inside modal
  const filteredList = targetVehicles
    .filter(v => agencyFilter === 'TODAS' || v.agency === agencyFilter)
    .filter(v => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        v.caract.toLowerCase().includes(term) ||
        v.numser.toLowerCase().includes(term) ||
        v.agency.toLowerCase().includes(term) ||
        v.ubicacion.toLowerCase().includes(term) ||
        v.numinv.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (b.dias || 0) - (a.dias || 0));

  const totalFilteredValue = filteredList.reduce((acc, v) => acc + (v.ctototal || 0), 0);
  const totalFilteredCost = filteredList.reduce((acc, v) => acc + (v.svc_cost_est || 0), 0);

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* High Impact Executive Counter Bar */}
      <div
        className="section-card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.3)',
          padding: '1.5rem 1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ff4d6d', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              NISSAN GASME AUTOMOTRIZ • CONTEO VITAL DE INVENTARIO
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>
              📊 Control Global de Permanencia en Stock
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              className="btn"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', borderRadius: '99px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('ALL'); }}
            >
              🔍 Ver Todo el Inventario ({summary.total_vehicles})
            </button>
          </div>
        </div>

        {/* 4 Interactive Counter Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          {/* 1. EN REGLA (<90d) */}
          <div
            style={{
              background: 'rgba(74, 222, 128, 0.08)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>✅</span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>56.1% Flota 0km</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#4ade80', marginTop: '0.4rem' }}>
                {fmtInt(summary.total_ok)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Vehículos En Regla
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Menos de 90 días en stock (sin costo de servicio)
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('OK'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(74, 222, 128, 0.5)',
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              👁️ Ver 426 Unidades ↓
            </button>
          </div>

          {/* 2. ALERTA (>90d) */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🚨</span>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>43.9% Flota 0km</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444', marginTop: '0.4rem' }}>
                {fmtInt(summary.total_pending)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Con Alerta (≥ 90 Días)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Generan servicios a cargo de la agencia (${fmt(summary.total_svc_cost_est)})
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('OVER90'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🚨 Inspeccionar 333 Unidades ↓
            </button>
          </div>

          {/* 3. SEMINUEVOS */}
          <div
            style={{
              background: 'rgba(192, 132, 252, 0.08)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🔄</span>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Intercambios</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#c084fc', marginTop: '0.4rem' }}>
                {fmtInt(summary.total_used)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Seminuevos
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Unidades de retoma o importación (reglas especiales)
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('USED'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(192, 132, 252, 0.5)',
                background: 'rgba(192, 132, 252, 0.15)',
                color: '#c084fc',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🔄 Ver 108 Seminuevos ↓
            </button>
          </div>

          {/* 4. TOTAL GRUPO */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🚗</span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700' }}>Grupo Gasme</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#38bdf8', marginTop: '0.4rem' }}>
                {fmtInt(summary.total_vehicles)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Total Flota Registrada
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Valor activo de inventario: ${fmt(summary.total_fleet_value)} MXN
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('ALL'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              📋 Ver Lista Completa ↓
            </button>
          </div>

        </div>
      </div>

      {/* PORTAL MODAL FOR DETAILED DROPDOWN / LIST INSPECTION */}
      {modalType && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setModalType(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6)',
              padding: '1.75rem',
              width: 'min(96vw, 1300px)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: modalBadgeColor, color: '#000', fontWeight: '800', fontSize: '0.85rem' }}>
                    {filteredList.length} Vehículos Encontrados
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                    Valor Total: ${fmt(totalFilteredValue)} MXN
                  </span>
                  {totalFilteredCost > 0 && (
                    <span className="badge badge-danger" style={{ fontSize: '0.8rem' }}>
                      💸 Costo Svc Est: ${fmt(totalFilteredCost)} MXN
                    </span>
                  )}
                </div>
                <h2 style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: '800' }}>
                  {modalTitle}
                </h2>
              </div>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>

            {/* Filter Bar Inside Modal */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 Buscar por VIN (serie), modelo, agencia, color o inv..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />

              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AGENCIA:</span>
                {['TODAS', ...data.agencies].map(ag => (
                  <button
                    key={ag}
                    onClick={() => setAgencyFilter(ag)}
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '99px',
                      fontSize: '0.73rem',
                      cursor: 'pointer',
                      border: `1px solid ${agencyFilter === ag ? 'var(--nissan-red)' : 'var(--border-color)'}`,
                      background: agencyFilter === ag ? 'var(--nissan-red)' : 'transparent',
                      color: agencyFilter === ag ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 3 }}>
                  <tr>
                    {['#', 'Agencia', 'Estado', 'Días', 'Modelo / Vehículo', 'Año', 'Color', 'Serie (VIN)', 'Ubicación Física', 'Precio (MXN)', 'Servicio Pendiente', 'Costo Est.'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '0.6rem 0.75rem',
                          textAlign: 'left',
                          color: 'var(--text-secondary)',
                          fontWeight: '700',
                          fontSize: '0.72rem',
                          borderBottom: '2px solid var(--border-color)',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((v, i) => {
                    const isOver90 = (v.dias || 0) >= 90;
                    const isUsed = v.svc_category === undefined;
                    return (
                      <tr
                        key={v.numser || i}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{i + 1}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '800', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>📍 {v.agency}</td>
                        <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '99px',
                              fontWeight: '700',
                              fontSize: '0.72rem',
                              background: isUsed ? 'rgba(192,132,252,0.15)' : isOver90 ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                              color: isUsed ? '#c084fc' : isOver90 ? '#ef4444' : '#4ade80',
                              border: `1px solid ${isUsed ? '#c084fc44' : isOver90 ? '#ef444444' : '#4ade8044'}`,
                            }}
                          >
                            {isUsed ? '🔄 Seminuevo' : isOver90 ? '🚨 Alerta Servicio' : '✅ En Regla'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '900', color: isOver90 ? '#ef4444' : '#4ade80', fontSize: '0.85rem' }}>
                          {v.dias}d
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>
                          {v.caract}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {v.svc_label || (isUsed ? 'N/A Seminuevo' : '—')}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '800', color: v.svc_cost_est > 0 ? '#f59e0b' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {v.svc_cost_est > 0 ? `$${fmt(v.svc_cost_est)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Mostrando {filteredList.length} de {targetVehicles.length} registros en esta categoría
              </span>
              <button className="btn btn-secondary" onClick={() => setModalType(null)}>
                Cerrar Inspección
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
