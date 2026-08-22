import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ServiceDetailModal({ item, onClose }) {
  if (!item) return null;

  const { numpaq, line_code, line_name, prices, classifications, items_by_agency, cause_summary, price_diff } = item;

  const agencies = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC'];

  const agencyDisplayNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const modal = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="apple-status-pill danger" style={{ fontSize: '0.8rem' }}>
                PAQUETE: {numpaq}
              </span>
              <span className="apple-status-pill purple" style={{ fontSize: '0.8rem' }}>
                LÍNEA: {line_code} - {line_name}
              </span>
              {price_diff > 5 && (
                <span className="apple-status-pill warning" style={{ fontSize: '0.8rem' }}>
                  💸 Dif. Precios: ${price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              )}
            </div>
            <h2 style={{ marginTop: '0.6rem', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800' }}>
              Desglose y Comparativo Lado a Lado por Agencia
            </h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar ventana">✕</button>
        </div>

        {/* Cause summary */}
        {cause_summary && cause_summary.length > 0 && (
          <div className="cause-explanation-banner" style={{ margin: '0 0 1.25rem 0' }}>
            <div style={{ color: '#e11d48', marginBottom: '0.3rem', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
              📌 ORIGEN DE LA DISCREPANCIA (CAUSA RAÍZ):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.4' }}>
              {cause_summary.map((cause, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{cause}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3rem' }}>
          <div className="agency-cards-grid">
            {agencies.map(ag => {
              const price = prices[ag] || 0;
              const items = items_by_agency[ag] || [];
              const classification = classifications[ag] || {};
              const isPresent = items.length > 0;

              let pillClass = 'success';
              let borderStyle = '1px solid rgba(226, 232, 240, 0.8)';
              let bgStyle = '#ffffff';

              if (!isPresent) {
                pillClass = 'warning';
                borderStyle = '1px dashed rgba(203, 213, 225, 0.6)';
                bgStyle = '#f8fafc';
              } else if (classification.status === 'LABOR_ONLY') {
                pillClass = 'danger';
                borderStyle = '1px solid rgba(225, 29, 72, 0.3)';
                bgStyle = '#fef2f2';
              } else if (classification.status === 'PARTS_ONLY') {
                pillClass = 'warning';
                borderStyle = '1px solid rgba(217, 119, 6, 0.3)';
                bgStyle = '#fffbeb';
              } else if (classification.status === 'COMPLETE_SYNTHETIC') {
                pillClass = 'purple';
                borderStyle = '1px solid rgba(124, 58, 237, 0.3)';
                bgStyle = '#f5f3ff';
              } else if (classification.status === 'COMPLETE') {
                pillClass = 'success';
                borderStyle = '1px solid rgba(5, 150, 105, 0.3)';
                bgStyle = '#ecfdf5';
              }

              return (
                <div
                  key={ag}
                  className="agency-detail-card"
                  style={{
                    border: borderStyle,
                    opacity: isPresent ? 1 : 0.65,
                    background: bgStyle
                  }}
                >
                  <div className="agency-detail-card-header">
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                      📍 {agencyDisplayNames[ag]}
                    </h3>
                    <div className={`apple-status-pill ${pillClass}`} style={{ fontSize: '0.725rem', marginTop: '0.35rem' }}>
                      {classification.label || (isPresent ? 'Registrado' : 'No Registrado')}
                    </div>
                  </div>

                  {isPresent ? (
                    <>
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(226,232,240,0.6)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Precio Venta Total:</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>MXN</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.85rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', borderBottom: '1px solid rgba(226,232,240,0.8)', paddingBottom: '0.3rem' }}>
                          Ítems e Insumos ({items.length}):
                        </h4>
                        <ul className="items-mini-list">
                          {items.map((it, idx) => {
                            const isLabor = it.hortra > 0 || ['PA1', '10K', '20K', '30K', '40K', '50K', '60K'].includes(it.art);
                            const isSynthetic = it.art.includes('EMT') || it.desc.includes('SINTETICO');
                            return (
                              <li key={idx} style={{ marginBottom: '0.45rem', fontSize: '0.8rem', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(241,245,249,0.8)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                  <span style={{ color: isLabor ? '#2563eb' : isSynthetic ? '#7c3aed' : '#059669' }}>
                                    {isLabor ? '🛠️' : isSynthetic ? '🧪' : '📦'} {it.art}
                                  </span>
                                  <span style={{ fontFamily: 'var(--font-mono)' }}>${it.totventra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                  {it.desc}
                                  {it.hortra > 0 && <span style={{ marginLeft: '0.4rem', color: '#2563eb', fontWeight: '600' }}>({it.hortra} hrs)</span>}
                                  {it.cantrefmat > 0 && <span style={{ marginLeft: '0.4rem', color: '#059669', fontWeight: '600' }}>({it.cantrefmat} cant)</span>}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      🚫 Este paquete no está cargado en {agencyDisplayNames[ag]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'right', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar Inspección</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
