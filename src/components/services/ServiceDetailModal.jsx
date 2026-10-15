import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ServiceDetailModal({ item, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [item]);

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'LABOR_ONLY': return { pillClass: 'danger', border: 'var(--status-danger-border)', bg: 'var(--status-danger-bg)' };
      case 'PARTS_ONLY': return { pillClass: 'warning', border: 'var(--status-warning-border)', bg: 'var(--status-warning-bg)' };
      case 'COMPLETE_SYNTHETIC': return { pillClass: 'purple', border: 'var(--status-purple-border)', bg: 'var(--status-purple-bg)' };
      case 'COMPLETE': return { pillClass: 'success', border: 'var(--status-success-border)', bg: 'var(--status-success-bg)' };
      default: return { pillClass: 'warning', border: 'var(--border-subtle)', bg: 'var(--bg-subtle)' };
    }
  };

  const getItemColor = (it) => {
    const isLabor = it.hortra > 0 || ['PA1', '10K', '20K', '30K', '40K', '50K', '60K'].includes(it.art);
    const isSynthetic = it.art.includes('EMT') || it.desc.includes('SINTETICO');
    if (isLabor) return 'var(--status-info)';
    if (isSynthetic) return 'var(--status-purple)';
    return 'var(--status-success)';
  };

  const getItemTag = (it) => {
    const isLabor = it.hortra > 0 || ['PA1', '10K', '20K', '30K', '40K', '50K', '60K'].includes(it.art);
    const isSynthetic = it.art.includes('EMT') || it.desc.includes('SINTETICO');
    if (isLabor) return 'MO';
    if (isSynthetic) return 'SIN';
    return 'REF';
  };

  const modal = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="apple-status-pill danger" style={{ fontSize: '0.75rem' }}>
                PAQUETE: {numpaq}
              </span>
              <span className="apple-status-pill info" style={{ fontSize: '0.75rem' }}>
                LÍNEA: {line_code} · {line_name}
              </span>
              {price_diff > 5 && (
                <span className="apple-status-pill warning" style={{ fontSize: '0.75rem' }}>
                  Dif. Precios: ${price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              )}
            </div>
            <h2 style={{ marginTop: '0.6rem', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: '800' }}>
              Desglose y Comparativo Lado a Lado por Agencia
            </h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar ventana">✕</button>
        </div>

        {/* Cause summary */}
        {cause_summary && cause_summary.length > 0 && (
          <div className="cause-explanation-banner" style={{ margin: '0 0 1.25rem 0' }}>
            <div style={{ color: 'var(--status-danger)', marginBottom: '0.3rem', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Origen de la Discrepancia (Causa Raíz)
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              {cause_summary.map((cause, idx) => (
                <li key={idx} style={{ marginBottom: '0.15rem' }}>{cause}</li>
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

              const cfg = getStatusConfig(isPresent ? classification.status : null);
              if (!isPresent) {
                cfg.pillClass = 'warning';
                cfg.border = 'var(--border-subtle)';
                cfg.bg = 'var(--bg-subtle)';
              }

              return (
                <div
                  key={ag}
                  className="agency-detail-card"
                  style={{
                    border: `1px solid ${cfg.border}`,
                    opacity: isPresent ? 1 : 0.6,
                    background: cfg.bg
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                      {agencyDisplayNames[ag]}
                    </h3>
                    <div className={`apple-status-pill ${cfg.pillClass}`} style={{ fontSize: '0.7rem', marginTop: '0.35rem' }}>
                      {classification.label || (isPresent ? 'Registrado' : 'No Registrado')}
                    </div>
                  </div>

                  {isPresent ? (
                    <>
                      <div style={{ marginTop: '0.75rem', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Precio Venta Total</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.7rem', fontWeight: '600', fontFamily: 'var(--font-sans)' }}>MXN</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                          Ítems e Insumos ({items.length})
                        </h4>
                        <ul className="items-mini-list">
                          {items.map((it, idx) => (
                            <li key={idx} style={{ marginBottom: '0.35rem', fontSize: '0.78rem', paddingBottom: '0.3rem', borderBottom: '1px solid rgba(241,245,249,0.8)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                <span style={{ color: getItemColor(it), display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <span style={{ fontSize: '0.6rem', fontWeight: '800', padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(0,0,0,0.04)' }}>{getItemTag(it)}</span>
                                  {it.art}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>${it.totventra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                                {it.desc}
                                {it.hortra > 0 && <span style={{ marginLeft: '0.4rem', color: 'var(--status-info)', fontWeight: '600' }}>({it.hortra} hrs)</span>}
                                {it.cantrefmat > 0 && <span style={{ marginLeft: '0.4rem', color: 'var(--status-success)', fontWeight: '600' }}>({it.cantrefmat} cant)</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Este paquete no está cargado en {agencyDisplayNames[ag]}
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
