import React, { useState } from 'react';
import ServiceDetailModal from './ServiceDetailModal';

export default function ServicesAuditTab({ data }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  if (!data || !data.packages) return null;

  const agencies = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC'];
  const agencyNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  // Collect all combination lines across packages
  const auditItems = [];

  data.packages.forEach(pkg => {
    pkg.lines.forEach(line => {
      // Determine if there is any issue
      const isLocalCreation = pkg.agency_count === 1;
      const isCompositionMismatch = line.has_composition_mismatch;
      const isPriceVariation = line.has_price_variation;
      
      const statuses = Object.values(line.classifications).map(c => c.status);
      const isIncompleteCombo = statuses.includes('LABOR_ONLY') || statuses.includes('PARTS_ONLY');
      const isSyntheticMismatch = statuses.includes('COMPLETE_SYNTHETIC') && statuses.includes('COMPLETE');
      const isExtremePriceDiff = line.price_diff >= 200;

      if (isLocalCreation || isCompositionMismatch || isPriceVariation) {
        auditItems.push({
          numpaq: pkg.numpaq,
          primary_name: pkg.primary_name,
          agency_count: pkg.agency_count,
          line_code: line.line_code,
          line_name: line.line_name,
          agencies_present: line.agencies_present,
          prices: line.prices,
          costs: line.costs,
          price_min: line.price_min,
          price_max: line.price_max,
          price_diff: line.price_diff,
          classifications: line.classifications,
          cause_summary: line.cause_summary,
          items_by_agency: line.items_by_agency,
          item_codes: line.item_codes,
          flags: {
            isLocalCreation,
            isCompositionMismatch,
            isPriceVariation,
            isIncompleteCombo,
            isSyntheticMismatch,
            isExtremePriceDiff
          }
        });
      }
    });
  });

  // Filter items
  const filteredItems = auditItems.filter(item => {
    // Search text filter
    const matchesSearch =
      item.numpaq.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.line_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.line_code.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'INCOMPLETE') return item.flags.isIncompleteCombo;
    if (filterType === 'SYNTHETIC') return item.flags.isSyntheticMismatch;
    if (filterType === 'PRICE_EXTREME') return item.flags.isExtremePriceDiff;
    if (filterType === 'LOCAL') return item.flags.isLocalCreation;

    return true;
  });

  const statusLabel = (status) => {
    switch (status) {
      case 'LABOR_ONLY': return 'Solo MO (Falta Aceite/Filtro)';
      case 'PARTS_ONLY': return 'Solo Refacciones (Falta MO)';
      case 'COMPLETE_SYNTHETIC': return 'Aceite Sintético';
      case 'COMPLETE': return 'Completo';
      case 'OTHER': return 'Incompleto';
      default: return status;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'LABOR_ONLY': return 'var(--status-danger)';
      case 'PARTS_ONLY': return 'var(--status-warning)';
      case 'COMPLETE_SYNTHETIC': return 'var(--status-purple)';
      case 'COMPLETE': return 'var(--status-success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">Auditoría de Inconsistencias y Desalineación en Paquetes de Servicio</h2>
          <p className="subtitle">
            Identificación automática del <strong>por qué de cada discrepancia</strong>: combos incompletos (omisión de aceite/filtro o mano de obra), sustitución de lubricantes y variaciones extremas de precio entre agencias.
          </p>
        </div>
        <div className="apple-status-pill danger" style={{ fontSize: '0.82rem' }}>
          {auditItems.length} Combinaciones Inconsistentes
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div className="filter-pills" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', flex: 1 }}>
          <button
            className={`btn-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            Todos los Hallazgos ({auditItems.length})
          </button>
          <button
            className={`btn-pill ${filterType === 'INCOMPLETE' ? 'active' : ''}`}
            onClick={() => setFilterType('INCOMPLETE')}
          >
            Combos Incompletos ({auditItems.filter(i => i.flags.isIncompleteCombo).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'SYNTHETIC' ? 'active' : ''}`}
            onClick={() => setFilterType('SYNTHETIC')}
          >
            Sintético vs Mineral ({auditItems.filter(i => i.flags.isSyntheticMismatch).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'PRICE_EXTREME' ? 'active' : ''}`}
            onClick={() => setFilterType('PRICE_EXTREME')}
          >
            Dif. Precio &gt; $200 ({auditItems.filter(i => i.flags.isExtremePriceDiff).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterType('LOCAL')}
          >
            Creaciones Locales ({auditItems.filter(i => i.flags.isLocalCreation).length})
          </button>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por código, paquete o auto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '1rem' }}
          />
        </div>
      </div>

      {/* Audit Items List */}
      <div className="audit-cards-container">
        {filteredItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Sin hallazgos para este filtro</h3>
            <p>Intenta seleccionar otro filtro o cambiar el término de búsqueda.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div key={idx} className="audit-finding-card">
              <div className="audit-finding-header">
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="apple-status-pill danger" style={{ fontSize: '0.72rem' }}>
                      PAQUETE: {item.numpaq}
                    </span>
                    <span className="apple-status-pill info" style={{ fontSize: '0.72rem' }}>
                      MODELO: {item.line_code} · {item.line_name}
                    </span>
                    {item.flags.isLocalCreation && (
                      <span className="apple-status-pill purple" style={{ fontSize: '0.72rem' }}>
                        EXCLUSIVO 1 AGENCIA
                      </span>
                    )}
                    {item.price_diff > 5 && (
                      <span className="apple-status-pill warning" style={{ fontSize: '0.72rem' }}>
                        Rango: ${item.price_min.toLocaleString('es-MX', { minimumFractionDigits: 2 })} a ${item.price_max.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Dif: ${item.price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0.5rem 0 0.2rem 0', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: '700' }}>
                    {item.primary_name}
                  </h3>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedItem(item)}
                >
                  Ver Desglose Lado a Lado
                </button>
              </div>

              {/* Explicit Cause Explanation Banner */}
              <div className="cause-explanation-banner">
                <div style={{ fontWeight: '700', color: 'var(--status-danger)', marginBottom: '0.3rem', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Causa Raíz de la Discrepancia
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {item.cause_summary && item.cause_summary.length > 0 ? (
                    item.cause_summary.map((cause, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <span style={{ color: 'var(--status-danger)', fontWeight: '700', flexShrink: 0 }}>•</span>
                        <span>{cause}</span>
                      </div>
                    ))
                  ) : (
                    <div>Inconsistencia en la lista de refacciones o mano de obra asignada por las agencias.</div>
                  )}
                </div>
              </div>

              {/* Side by side Agency Strip */}
              <div className="agency-strip-grid">
                {agencies.map(ag => {
                  const price = item.prices[ag] || 0;
                  const classification = item.classifications[ag] || {};
                  const isPresent = item.agencies_present.includes(ag);

                  let borderStyle = '1px solid var(--border-subtle)';
                  let bgStyle = 'var(--bg-card)';

                  if (!isPresent) {
                    borderStyle = '1px dashed var(--border-glass)';
                    bgStyle = 'var(--bg-subtle)';
                  } else if (classification.status === 'LABOR_ONLY') {
                    borderStyle = `1px solid var(--status-danger-border)`;
                    bgStyle = 'var(--status-danger-bg)';
                  } else if (classification.status === 'PARTS_ONLY') {
                    borderStyle = `1px solid var(--status-warning-border)`;
                    bgStyle = 'var(--status-warning-bg)';
                  } else if (classification.status === 'COMPLETE_SYNTHETIC') {
                    borderStyle = `1px solid var(--status-purple-border)`;
                    bgStyle = 'var(--status-purple-bg)';
                  } else if (classification.status === 'COMPLETE') {
                    borderStyle = `1px solid var(--status-success-border)`;
                    bgStyle = 'var(--status-success-bg)';
                  }

                  return (
                    <div key={ag} className="agency-strip-card" style={{ border: borderStyle, background: bgStyle }}>
                      <div className="agency-strip-title">{agencyNames[ag]}</div>
                      {isPresent ? (
                        <>
                          <div className="agency-strip-price">
                            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="agency-strip-label" style={{ color: statusColor(classification.status) }}>
                            {statusLabel(classification.status)}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                          No Cargado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal detail */}
      {selectedItem && (
        <ServiceDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
