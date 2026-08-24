import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Car,
  Search,
  X,
  MapPin,
  FileText,
  DollarSign,
  Building2,
  ListFilter
} from 'lucide-react';

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
  let modalBadgeColor = 'var(--status-info)';

  if (modalType === 'OK') {
    targetVehicles = vehicles_new.filter(v => v.svc_category === 'OK');
    modalTitle = 'Vehículos En Regla (< 90 Días en Inventario)';
    modalBadgeColor = 'var(--status-success)';
  } else if (modalType === 'OVER90') {
    targetVehicles = vehicles_new.filter(v => v.svc_category !== 'OK');
    modalTitle = 'Vehículos Con Alerta (≥ 90 Días · Generan Costo de Servicio)';
    modalBadgeColor = 'var(--status-danger)';
  } else if (modalType === 'USED') {
    targetVehicles = vehicles_used;
    modalTitle = 'Seminuevos / Vehículos de Intercambio';
    modalBadgeColor = 'var(--status-purple)';
  } else if (modalType === 'ALL') {
    targetVehicles = [...vehicles_new, ...vehicles_used];
    modalTitle = 'Inventario Completo del Grupo (867 Unidades)';
    modalBadgeColor = 'var(--text-primary)';
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
      {/* High-Impact Executive Light Counter Container */}
      <div
        className="section-card"
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nissan-red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              NISSAN GASME AUTOMOTRIZ · CONTEO VITAL DE INVENTARIO
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Control Global de Permanencia en Stock
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1.1rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('ALL'); }}
            >
              <Search size={15} />
              <span>Ver Todo el Inventario ({summary.total_vehicles})</span>
            </button>
          </div>
        </div>

        {/* 4 Light Cards inside counter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          {/* 1. EN REGLA (<90d) */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CheckCircle2 size={22} color="#16a34a" />
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>56.1% Flota 0km</span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#15803d', marginTop: '0.4rem', lineHeight: '1.1' }}>
                {fmtInt(summary.total_ok)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#14532d', marginTop: '0.2rem' }}>
                Vehículos En Regla
              </div>
              <div style={{ fontSize: '0.78rem', color: '#374151', marginTop: '0.25rem', lineHeight: '1.3' }}>
                Menos de 90 días en stock (sin costo de servicio)
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('OK'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #86efac',
                background: '#ffffff',
                color: '#15803d',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Ver 426 Unidades</span>
            </button>
          </div>

          {/* 2. ALERTA (>90d) */}
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AlertTriangle size={22} color="#dc2626" />
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>43.9% Flota 0km</span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#b91c1c', marginTop: '0.4rem', lineHeight: '1.1' }}>
                {fmtInt(summary.total_pending)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#991b1b', marginTop: '0.2rem' }}>
                Con Alerta (≥ 90 Días)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '0.25rem', lineHeight: '1.3' }}>
                Generan servicios a cargo de agencia (${fmt(summary.total_svc_cost_est)})
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('OVER90'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #fca5a5',
                background: '#ffffff',
                color: '#b91c1c',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Inspeccionar 333 Unidades</span>
            </button>
          </div>

          {/* 3. SEMINUEVOS */}
          <div
            style={{
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <RefreshCw size={20} color="#9333ea" />
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Intercambios</span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#6b21a8', marginTop: '0.4rem', lineHeight: '1.1' }}>
                {fmtInt(summary.total_used)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#581c87', marginTop: '0.2rem' }}>
                Seminuevos
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '0.25rem', lineHeight: '1.3' }}>
                Unidades de retoma o importación (reglas especiales)
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('USED'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #d8b4fe',
                background: '#ffffff',
                color: '#6b21a8',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Ver 108 Seminuevos</span>
            </button>
          </div>

          {/* 4. TOTAL GRUPO */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Car size={22} color="#0284c7" />
                <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: '700', background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>Grupo Gasme</span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0369a1', marginTop: '0.4rem', lineHeight: '1.1' }}>
                {fmtInt(summary.total_vehicles)}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0c4a6e', marginTop: '0.2rem' }}>
                Total Flota Registrada
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '0.25rem', lineHeight: '1.3' }}>
                Valor activo de inventario: ${fmt(summary.total_fleet_value)} MXN
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setAgencyFilter('TODAS'); setModalType('ALL'); }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #7dd3fc',
                background: '#ffffff',
                color: '#0369a1',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Ver Lista Completa</span>
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
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
              background: '#ffffff',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
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
                  <span className="badge" style={{ background: modalBadgeColor, color: '#ffffff', fontWeight: '700', fontSize: '0.8rem' }}>
                    {filteredList.length} Vehículos Encontrados
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                    Valor Total: ${fmt(totalFilteredValue)} MXN
                  </span>
                  {totalFilteredCost > 0 && (
                    <span className="badge badge-danger" style={{ fontSize: '0.8rem' }}>
                      Costo Svc Est: ${fmt(totalFilteredCost)} MXN
                    </span>
                  )}
                </div>
                <h2 style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: '800' }}>
                  {modalTitle}
                </h2>
              </div>
              <button className="btn-close" onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Filter Bar Inside Modal */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
                <input
                  type="text"
                  placeholder="Buscar por VIN (serie), modelo, agencia, color o inv..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AGENCIA:</span>
                {['TODAS', ...data.agencies].map(ag => (
                  <button
                    key={ag}
                    onClick={() => setAgencyFilter(ag)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: `1px solid ${agencyFilter === ag ? 'var(--nissan-red)' : 'var(--border-subtle)'}`,
                      background: agencyFilter === ag ? 'var(--nissan-red)' : '#ffffff',
                      color: agencyFilter === ag ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 3 }}>
                  <tr>
                    {['#', 'Agencia', 'Estado', 'Días', 'Modelo / Vehículo', 'Año', 'Color', 'Serie (VIN)', 'Ubicación Física', 'Precio (MXN)', 'Servicio Pendiente', 'Costo Est.'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'left',
                          color: 'var(--text-secondary)',
                          fontWeight: '700',
                          fontSize: '0.72rem',
                          borderBottom: '2px solid var(--border-subtle)',
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
                          borderBottom: '1px solid var(--border-subtle)',
                          background: i % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)',
                        }}
                      >
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{i + 1}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v.agency}</td>
                        <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '99px',
                              fontWeight: '700',
                              fontSize: '0.72rem',
                              background: isUsed ? '#faf5ff' : isOver90 ? '#fef2f2' : '#f0fdf4',
                              color: isUsed ? '#6b21a8' : isOver90 ? '#b91c1c' : '#15803d',
                              border: `1px solid ${isUsed ? '#e9d5ff' : isOver90 ? '#fecaca' : '#bbf7d0'}`,
                            }}
                          >
                            {isUsed ? 'Seminuevo' : isOver90 ? 'Alerta Servicio' : 'En Regla'}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: isOver90 ? '#b91c1c' : '#15803d', fontSize: '0.85rem' }}>
                          {v.dias}d
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-primary)', maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.caract}>
                          {v.caract}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)' }}>{v.moduni}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.color}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.numser}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.ubicacion}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${fmt(v.ctototal)}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {v.svc_label || (isUsed ? 'N/A Seminuevo' : 'Ninguno')}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '800', color: v.svc_cost_est > 0 ? '#d97706' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {v.svc_cost_est > 0 ? `$${fmt(v.svc_cost_est)}` : 'N/A'}
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
