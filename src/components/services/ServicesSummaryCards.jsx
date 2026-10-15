import React from 'react';

export default function ServicesSummaryCards({ data }) {
  if (!data) return null;

  const totalPackages = data.total_package_codes || 0;
  const stats = data.stats || {};
  const standardizedPct = totalPackages
    ? (((stats.fully_standardized_packages || 0) / totalPackages) * 100).toFixed(1)
    : 0;

  return (
    <div className="executive-master-section">
      {/* Master Title & Hero Number */}
      <div className="master-header-row">
        <div className="master-tag">Catálogo Máster</div>
        <div className="master-val-row">
          <span className="master-big-val">{totalPackages.toLocaleString()}</span>
          <span className="master-val-label">Combos Registrados</span>
          <span className="master-badge-pill success">
            {standardizedPct}% Estandarizados
          </span>
        </div>
      </div>

      {/* 4 Separate Executive KPI Cards */}
      <div className="executive-kpi-grid">
        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Homologados</span>
          <span className="executive-kpi-number">
            {(stats.fully_standardized_packages || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Paquetes idénticos en las 6 agencias
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Discrepancias</span>
          <span className="executive-kpi-number">
            {(stats.composition_mismatch_combinations || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Insumos o mano de obra alterada entre agencias
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Variación</span>
          <span className="executive-kpi-number">
            {(stats.price_variation_combinations || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Diferencia de costo mayor a $5 MXN
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Creaciones</span>
          <span className="executive-kpi-number">
            {(stats.local_creations_packages || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Combos exclusivos en 1 sola agencia
          </span>
        </div>
      </div>
    </div>
  );
}
