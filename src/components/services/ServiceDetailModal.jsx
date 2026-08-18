import React, { useEffect } from 'react';

export default function ServiceDetailModal({ item, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95%' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-nissan" style={{ fontSize: '0.9rem' }}>
                PAQUETE: {numpaq}
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.9rem' }}>
                LÍNEA: {line_code} - {line_name}
              </span>
              {price_diff > 5 && (
                <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>
                  💸 Dif. Precios: ${price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              )}
            </div>
            <h2 style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
              Desglose y Comparación por Agencia
            </h2>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Cause summary box */}
        {cause_summary && cause_summary.length > 0 && (
          <div className="cause-alert-box">
            <h4 style={{ color: 'var(--nissan-red)', marginBottom: '0.4rem', fontWeight: '700' }}>
              🚨 Explicación del Origen de la Discrepancia:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {cause_summary.map((cause, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{cause}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem 0' }}>
          <div className="agency-cards-grid">
            {agencies.map(ag => {
              const price = prices[ag] || 0;
              const items = items_by_agency[ag] || [];
              const classification = classifications[ag] || {};
              const isPresent = items.length > 0;

              let statusBadgeClass = 'badge-success';
              if (!isPresent) statusBadgeClass = 'badge-secondary';
              else if (classification.status === 'LABOR_ONLY') statusBadgeClass = 'badge-danger';
              else if (classification.status === 'PARTS_ONLY') statusBadgeClass = 'badge-warning';
              else if (classification.status === 'COMPLETE_SYNTHETIC') statusBadgeClass = 'badge-purple';

              return (
                <div
                  key={ag}
                  className="agency-detail-card"
                  style={{
                    border: isPresent ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                    opacity: isPresent ? 1 : 0.6,
                    background: isPresent ? 'var(--bg-card)' : 'var(--bg-secondary)'
                  }}
                >
                  <div className="agency-detail-card-header">
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
                      📍 {agencyDisplayNames[ag]}
                    </h3>
                    <div className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
                      {classification.label || (isPresent ? 'Registrado' : 'No Registrado')}
                    </div>
                  </div>

                  {isPresent ? (
                    <>
                      <div className="agency-price-tag">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Precio Total Venta:</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--nissan-red)' }}>
                          ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.75rem' }}>MXN</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}>
                          Ítems e Insumos ({items.length}):
                        </h4>
                        <ul className="items-mini-list">
                          {items.map((it, idx) => {
                            const isLabor = it.hortra > 0 || ['PA1', '10K', '20K', '30K', '40K', '50K', '60K'].includes(it.art);
                            const isSynthetic = it.art.includes('EMT') || it.desc.includes('SINTETICO');
                            return (
                              <li key={idx} style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                  <span style={{ color: isLabor ? '#38bdf8' : isSynthetic ? '#c084fc' : '#4ade80' }}>
                                    {isLabor ? '🛠️' : isSynthetic ? '🧪' : '📦'} {it.art}
                                  </span>
                                  <span>${it.totventra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                  {it.desc}
                                  {it.hortra > 0 && <span style={{ marginLeft: '0.4rem', color: '#38bdf8' }}>({it.hortra} hrs)</span>}
                                  {it.cantrefmat > 0 && <span style={{ marginLeft: '0.4rem', color: '#4ade80' }}>({it.cantrefmat} cant)</span>}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      🚫 Este paquete no está cargado en {agencyDisplayNames[ag]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar Inspección</button>
        </div>
      </div>
    </div>
  );
}
