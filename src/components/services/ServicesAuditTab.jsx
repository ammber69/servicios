import React, { useState } from 'react';
import ServiceDetailModal from './ServiceDetailModal';
import { stripEmojis } from '../../utils/textUtils';

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
      default: return 'No Registrado';
    }
  };

  return (
    <div className="executive-section-wrapper">
      {/* Section Sub-Header matching Mockup */}
      <div className="executive-section-heading">
        <div className="section-heading-text">
          <h2 className="section-heading-title">Inconsistencias y Causa Raíz</h2>
          <div className="section-heading-sub">
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Auditoría de Inconsistencias</span>
            <span className="executive-badge-counter">
              {filteredItems.length} Combinaciones Inconsistentes
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="executive-filter-toolbar">
        <div className="filter-pills-row">
          <button
            className={`executive-filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            Todos ({auditItems.length})
          </button>
          <button
            className={`executive-filter-btn ${filterType === 'INCOMPLETE' ? 'active' : ''}`}
            onClick={() => setFilterType('INCOMPLETE')}
          >
            Combos Incompletos ({auditItems.filter(i => i.flags.isIncompleteCombo).length})
          </button>
          <button
            className={`executive-filter-btn ${filterType === 'SYNTHETIC' ? 'active' : ''}`}
            onClick={() => setFilterType('SYNTHETIC')}
          >
            Sintético vs Mineral ({auditItems.filter(i => i.flags.isSyntheticMismatch).length})
          </button>
          <button
            className={`executive-filter-btn ${filterType === 'PRICE_EXTREME' ? 'active' : ''}`}
            onClick={() => setFilterType('PRICE_EXTREME')}
          >
            Dif. Precio &gt; $200 ({auditItems.filter(i => i.flags.isExtremePriceDiff).length})
          </button>
          <button
            className={`executive-filter-btn ${filterType === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterType('LOCAL')}
          >
            Creaciones Locales ({auditItems.filter(i => i.flags.isLocalCreation).length})
          </button>
        </div>

        <div className="executive-search-wrapper">
          <input
            type="text"
            className="executive-search-input"
            placeholder="Buscar por código, paquete o auto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Items List matching Mockup Cards */}
      <div className="executive-cards-stack">
        {filteredItems.length === 0 ? (
          <div className="executive-empty-state">
            <h3>Sin hallazgos para este filtro</h3>
            <p>Intenta seleccionar otro filtro o cambiar el término de búsqueda.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div key={idx} className="executive-card">
              {/* Card Top: Badges + Action Button */}
              <div className="card-top-row">
                <div className="card-badges-row">
                  <span className="card-badge-pill neutral">
                    PAQUETE: {item.numpaq}
                  </span>
                  <span className="card-badge-pill info">
                    MODELO: {item.line_code} · {item.line_name}
                  </span>
                  {item.flags.isLocalCreation && (
                    <span className="card-badge-pill purple">
                      EXCLUSIVO 1 AGENCIA
                    </span>
                  )}
                  {item.price_diff > 5 && (
                    <span className="card-badge-pill subtle">
                      Rango: ${item.price_min.toLocaleString('es-MX', { minimumFractionDigits: 2 })} a ${item.price_max.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Dif: ${item.price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)
                    </span>
                  )}
                </div>

                <button
                  className="executive-pill-btn-dark"
                  onClick={() => setSelectedItem(item)}
                >
                  Ver Desglose Lado a Lado
                </button>
              </div>

              {/* Package Title */}
              <h3 className="card-package-title">
                {item.primary_name}
              </h3>

              {/* Slate Banner for Causa Raíz (NO EMOJIS) */}
              <div className="executive-cause-banner">
                <div className="cause-banner-header">
                  Causa Raíz de la Discrepancia
                </div>
                <div className="cause-banner-body">
                  {item.cause_summary && item.cause_summary.length > 0 ? (
                    item.cause_summary.map((cause, cIdx) => (
                      <div key={cIdx} className="cause-bullet-row">
                        <span className="cause-bullet-dot">•</span>
                        <span className="cause-bullet-text">{stripEmojis(cause)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="cause-bullet-row">
                      <span className="cause-bullet-dot">•</span>
                      <span className="cause-bullet-text">Inconsistencia en la lista de refacciones o mano de obra asignada por las agencias.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Side by side Agency Grid (Uniform, Clean, No colored fills) */}
              <div className="executive-agency-grid">
                {agencies.map(ag => {
                  const price = item.prices[ag] || 0;
                  const classification = item.classifications[ag] || {};
                  const isPresent = item.agencies_present.includes(ag);

                  return (
                    <div
                      key={ag}
                      className={`executive-agency-cell ${!isPresent ? 'absent' : ''}`}
                    >
                      <div className="agency-cell-name">{agencyNames[ag]}</div>
                      <div className="agency-cell-price">
                        {isPresent
                          ? `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                          : '$0.00'}
                      </div>
                      <div className="agency-cell-status">
                        {isPresent ? statusLabel(classification.status) : 'No Registrado'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Side-by-side Modal */}
      {selectedItem && (
        <ServiceDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
