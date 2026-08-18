import React, { useState } from 'react';
import ServiceDetailModal from './ServiceDetailModal';

export default function ServicesModelComparerTab({ data }) {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  if (!data || !data.packages) return null;

  const agencies = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC'];
  const agencyDisplayNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  // Extract all lines across packages and count packages per line
  const lineMap = {};

  data.packages.forEach(pkg => {
    pkg.lines.forEach(line => {
      const lineKey = `${line.line_code}||${line.line_name}`;
      if (!lineMap[lineKey]) {
        lineMap[lineKey] = {
          line_code: line.line_code,
          line_name: line.line_name,
          full_name: `${line.line_code} - ${line.line_name}`,
          packages: []
        };
      }
      lineMap[lineKey].packages.push({
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
        has_composition_mismatch: line.has_composition_mismatch,
        has_price_variation: line.has_price_variation
      });
    });
  });

  const linesList = Object.values(lineMap).sort((a, b) => b.packages.length - a.packages.length);

  // Set default selected line if none selected
  const activeLineKey = selectedLine || (linesList.length > 0 ? `${linesList[0].line_code}||${linesList[0].line_name}` : '');
  const activeLineData = lineMap[activeLineKey];

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">🚗 Comparativo por Línea / Modelo de Vehículo</h2>
          <p className="subtitle">
            Selecciona el modelo de automóvil (ej. NP300, Versa, March, Frontier) para auditar y comparar todos los paquetes de servicio disponibles entre las 6 agencias con desglose de causas.
          </p>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div style={{ background: 'var(--bg-header)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
          🏎️ Seleccionar Modelo / Línea Nissan ({linesList.length} Modelos Registrados):
        </label>
        <select
          className="search-input"
          style={{ width: '100%', fontSize: '1rem', padding: '0.6rem 1rem', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
          value={activeLineKey}
          onChange={e => setSelectedLine(e.target.value)}
        >
          {linesList.map(l => (
            <option key={`${l.line_code}||${l.line_name}`} value={`${l.line_code}||${l.line_name}`}>
              {l.full_name} ({l.packages.length} paquetes registrados)
            </option>
          ))}
        </select>
      </div>

      {/* Selected Model Data */}
      {activeLineData && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem' }}>
              Paquetes de Servicio para: <span style={{ color: 'var(--accent-purple)' }}>{activeLineData.full_name}</span>
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
              {activeLineData.packages.length} Paquetes Disponibles
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Paquete</th>
                  {agencies.map(b => (
                    <th key={b} style={{ textAlign: 'center' }}>
                      {agencyDisplayNames[b]}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Discrepancia / Causa</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activeLineData.packages.map((pkgItem, idx) => {
                  const prices = pkgItem.prices;
                  const isDiff = pkgItem.price_diff > 5;
                  const minPrice = pkgItem.price_min;
                  const maxPrice = pkgItem.price_max;

                  const statuses = Object.values(pkgItem.classifications).map(c => c.status);
                  const isIncomplete = statuses.includes('LABOR_ONLY') || statuses.includes('PARTS_ONLY');
                  const isSyntheticMismatch = statuses.includes('COMPLETE_SYNTHETIC') && statuses.includes('COMPLETE');

                  return (
                    <tr key={idx}>
                      <td className="code-cell" style={{ fontWeight: '700' }}>
                        {pkgItem.numpaq}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {pkgItem.primary_name}
                      </td>
                      {agencies.map(b => {
                        const price = prices[b] || 0;
                        const isPresent = pkgItem.agencies_present.includes(b);
                        const isMin = isPresent && isDiff && price === minPrice;
                        const isMax = isPresent && isDiff && price === maxPrice;
                        const classification = pkgItem.classifications[b] || {};

                        return (
                          <td
                            key={b}
                            style={{ textAlign: 'center' }}
                            className={isMin ? 'diff-highlight' : isMax ? 'diff-positive' : ''}
                          >
                            {isPresent ? (
                              <div>
                                <div style={{ fontWeight: '700' }}>
                                  ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </div>
                                {classification.status === 'LABOR_ONLY' && (
                                  <span className="badge badge-danger" style={{ fontSize: '0.65rem', display: 'block', marginTop: '0.2rem' }}>
                                    ⚠️ Solo MO
                                  </span>
                                )}
                                {classification.status === 'PARTS_ONLY' && (
                                  <span className="badge badge-warning" style={{ fontSize: '0.65rem', display: 'block', marginTop: '0.2rem' }}>
                                    ⚠️ Solo Ref.
                                  </span>
                                )}
                                {classification.status === 'COMPLETE_SYNTHETIC' && (
                                  <span className="badge badge-purple" style={{ fontSize: '0.65rem', display: 'block', marginTop: '0.2rem' }}>
                                    🧪 Sintético
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center' }}>
                        {isIncomplete ? (
                          <span className="badge badge-danger" title="Falta aceite/filtro o mano de obra en alguna agencia">
                            🚨 Combo Incompleto
                          </span>
                        ) : isSyntheticMismatch ? (
                          <span className="badge badge-purple" title="Una agencia usa aceite sintético y otra mineral">
                            🧪 Aceite Sintético
                          </span>
                        ) : isDiff ? (
                          <span className="badge badge-warning">
                            💸 Diff: ${pkgItem.price_diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="badge badge-success">Alineado</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          onClick={() => setSelectedItemModal(pkgItem)}
                        >
                          🔍 Desglose
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedItemModal && (
        <ServiceDetailModal
          item={selectedItemModal}
          onClose={() => setSelectedItemModal(null)}
        />
      )}
    </div>
  );
}
