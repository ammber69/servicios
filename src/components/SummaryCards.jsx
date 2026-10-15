import React from 'react';

export default function SummaryCards({ data }) {
  if (!data) return null;

  const totalCodes = data.total_codes || 0;
  const stats = data.stats || {};
  const standardizedPct = totalCodes
    ? (((stats.fully_standardized || 0) / totalCodes) * 100).toFixed(1)
    : 0;

  return (
    <div className="executive-master-section">
      {/* Master Title & Hero Number */}
      <div className="master-header-row">
        <div className="master-tag">Catálogo Máster</div>
        <div className="master-val-row">
          <span className="master-big-val">{totalCodes.toLocaleString()}</span>
          <span className="master-val-label">Códigos Únicos Registrados</span>
          <span className="master-badge-pill success">
            {standardizedPct}% Coincidencia Grupo
          </span>
        </div>
      </div>

      {/* 4 Separate Executive KPI Cards */}
      <div className="executive-kpi-grid">
        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Estandarizados</span>
          <span className="executive-kpi-number">
            {(stats.fully_standardized || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Trabajos idénticos en las 6 agencias
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Colisiones</span>
          <span className="executive-kpi-number">
            {(stats.critical_collisions || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Mismo código con diferente descripción
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Variantes</span>
          <span className="executive-kpi-number">
            {(stats.minor_typos || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Variaciones ortográficas o abreviaturas
          </span>
        </div>

        <div className="executive-kpi-card">
          <span className="executive-kpi-title">Creaciones</span>
          <span className="executive-kpi-number">
            {(stats.local_creations || 0).toLocaleString()}
          </span>
          <span className="executive-kpi-desc">
            Códigos exclusivos en 1 sola agencia
          </span>
        </div>
      </div>
    </div>
  );
}
