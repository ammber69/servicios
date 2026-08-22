import React from 'react';

export default function ServicesSummaryCards({ data }) {
  if (!data) return null;

  const totalPackages = data.total_package_codes || 0;
  const stats = data.stats || {};
  const standardizedPct = totalPackages ? (((stats.fully_standardized_packages || 0) / totalPackages) * 100).toFixed(1) : 0;

  return (
    <div className="apple-hero-banner">
      <div className="apple-hero-top">
        <div className="apple-primary-metric">
          <div className="apple-metric-tag">
            <span>📦</span> CATÁLOGO MÁSTER DE PAQUETES DE SERVICIO
          </div>
          <div className="apple-primary-val-row">
            <span className="apple-primary-val">{totalPackages.toLocaleString()}</span>
            <span className="apple-primary-label">Combos Registrados</span>
            <span className="apple-status-pill success">
              ✓ {standardizedPct}% Estandarizados ({(stats.fully_standardized_packages || 0).toLocaleString()})
            </span>
          </div>
          <p className="apple-primary-sub">
            Matriz de 34,994 configuraciones entre las 6 agencias (Córdoba, Juchitán, Orizaba, Salina Cruz, Tierra Blanca y Tuxtepec).
          </p>
        </div>
      </div>

      <div className="apple-divider-h"></div>

      <div className="apple-metrics-grid">
        <div className="apple-metric-col">
          <span className="apple-col-title">Homologados 100%</span>
          <span className="apple-col-val" style={{ color: '#059669' }}>
            {(stats.fully_standardized_packages || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Paquetes idénticos en costo, refacciones y mano de obra en el grupo.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Discrepancias Composición</span>
          <span className="apple-col-val" style={{ color: '#e11d48' }}>
            {(stats.composition_mismatch_combinations || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Insumos o mano de obra alterados vs paquete original de la marca.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Variación de Precio</span>
          <span className="apple-col-val" style={{ color: '#d97706' }}>
            {(stats.price_variation_combinations || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Diferencia mayor a $5 MXN en el costo total del mismo paquete.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Creaciones Locales</span>
          <span className="apple-col-val" style={{ color: '#7c3aed' }}>
            {(stats.local_creations_packages || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Combos exclusivos creados en 1 sola agencia (ej. Córdoba o Juchitán).</span>
        </div>
      </div>
    </div>
  );
}
