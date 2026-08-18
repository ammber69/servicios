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

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">⚠️ Auditoría de Inconsistencias y Desalineación en Paquetes de Servicio</h2>
          <p className="subtitle">
            Identificación automática del <strong>por qué de cada discrepancia</strong>: combos incompletos (omisión de aceite/filtro o mano de obra), sustitución de lubricantes y variaciones extremas de precio entre agencias.
          </p>
        </div>
        <div style={{ fontWeight: '700', color: 'var(--nissan-red)', background: 'rgba(195, 20, 50, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--nissan-red)' }}>
          🚨 {auditItems.length} Combinaciones Inconsistentes Identificadas
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="filter-pills" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          <button
            className={`btn-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            🔍 Todos los Hallazgos ({auditItems.length})
          </button>
          <button
            className={`btn-pill ${filterType === 'INCOMPLETE' ? 'active' : ''}`}
            onClick={() => setFilterType('INCOMPLETE')}
            style={{ borderColor: 'var(--nissan-red)' }}
          >
            ⚠️ Combos Incompletos ({auditItems.filter(i => i.flags.isIncompleteCombo).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'SYNTHETIC' ? 'active' : ''}`}
            onClick={() => setFilterType('SYNTHETIC')}
            style={{ borderColor: 'var(--accent-purple)' }}
          >
            🧪 Sintético vs Mineral ({auditItems.filter(i => i.flags.isSyntheticMismatch).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'PRICE_EXTREME' ? 'active' : ''}`}
            onClick={() => setFilterType('PRICE_EXTREME')}
            style={{ borderColor: 'var(--accent-amber)' }}
          >
            💸 Dif. Precio Extrema &gt; $200 ({auditItems.filter(i => i.flags.isExtremePriceDiff).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterType('LOCAL')}
            style={{ borderColor: 'var(--accent-purple)' }}
          >
            🟣 Creaciones Locales ({auditItems.filter(i => i.flags.isLocalCreation).length})
          </button>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por código, paquete o auto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Items List */}
      <div className="audit-cards-container">
        {filteredItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3>🎉 No se encontraron hallazgos para este filtro</h3>
            <p>Intenta seleccionar otro filtro o cambiar el término de búsqueda.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div key={idx} className="audit-finding-card">
              <div className="audit-finding-header">
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-nissan" style={{ fontSize: '0.85rem' }}>
                      PAQUETE: {item.numpaq}
                    </span>
                    <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
                      MODELO: {item.line_code} - {item.line_name}
                    </span>
                    {item.flags.isLocalCreation && (
                      <span className="badge badge-purple">🟣 EXCLUSIVO 1 AGENCIA</span>
                    )}
                    {item.price_diff > 5 && (
                      <span className="badge badge-danger">
                        💸 Rango de Precio: ${item.price_min.toLocaleString('es-MX', { minimumFractionDigits: 2 })} - ${item.price_max.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Dif: ${item.price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0.4rem 0 0.2rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                    {item.primary_name}
                  </h3>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedItem(item)}
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                >
                  🔍 Ver Desglose Lado a Lado
                </button>
              </div>

              {/* Explicit Cause Explanation Banner */}
              <div className="cause-explanation-banner">
                <div style={{ fontWeight: '700', color: 'var(--nissan-red)', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
                  📌 CAUSA RAÍZ DE LA DISCREPANCIA:
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {item.cause_summary && item.cause_summary.length > 0 ? (
                    item.cause_summary.map((cause, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span>•</span>
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

                  let borderStyle = '1px solid var(--border-color)';
                  let bgStyle = 'var(--bg-card)';

                  if (!isPresent) {
                    borderStyle = '1px dashed var(--border-color)';
                    bgStyle = 'rgba(255,255,255,0.02)';
                  } else if (classification.status === 'LABOR_ONLY') {
                    borderStyle = '1px solid var(--nissan-red)';
                    bgStyle = 'rgba(195, 20, 50, 0.08)';
                  } else if (classification.status === 'PARTS_ONLY') {
                    borderStyle = '1px solid var(--accent-amber)';
                    bgStyle = 'rgba(245, 158, 11, 0.08)';
                  } else if (classification.status === 'COMPLETE_SYNTHETIC') {
                    borderStyle = '1px solid var(--accent-purple)';
                    bgStyle = 'rgba(168, 85, 247, 0.08)';
                  }

                  return (
                    <div key={ag} className="agency-strip-card" style={{ border: borderStyle, background: bgStyle }}>
                      <div className="agency-strip-title">{agencyNames[ag]}</div>
                      {isPresent ? (
                        <>
                          <div className="agency-strip-price">
                            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="agency-strip-label">
                            {classification.status === 'LABOR_ONLY' && '⚠️ Solo MO (Falta Aceite/Filtro)'}
                            {classification.status === 'PARTS_ONLY' && '⚠️ Solo Refacciones (Falta MO)'}
                            {classification.status === 'COMPLETE_SYNTHETIC' && '🧪 Aceite Sintético'}
                            {classification.status === 'COMPLETE' && '✅ Completo'}
                            {classification.status === 'OTHER' && 'Incompleto'}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                          ❌ No Cargado
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
