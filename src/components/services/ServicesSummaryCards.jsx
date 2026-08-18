import React from 'react';

export default function ServicesSummaryCards({ data }) {
  if (!data) return null;

  const totalPackages = data.total_package_codes || 0;
  const stats = data.stats || {};

  return (
    <div className="kpi-grid">
      <div className="kpi-card blue">
        <div className="kpi-label">Catálogo Máster de Paquetes</div>
        <div className="kpi-value">{totalPackages.toLocaleString()}</div>
        <div className="kpi-sub">
          <span>Combos de servicio a nivel grupo (34,994 filas)</span>
        </div>
      </div>

      <div className="kpi-card emerald">
        <div className="kpi-label">Paquetes 100% Estandarizados</div>
        <div className="kpi-value">{(stats.fully_standardized_packages || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-success">
            {(((stats.fully_standardized_packages || 0) / totalPackages) * 100).toFixed(1)}% Coincidencia
          </span>
          <span>en las 6 agencias</span>
        </div>
      </div>

      <div className="kpi-card rose">
        <div className="kpi-label">Discrepancias en Composición</div>
        <div className="kpi-value">{(stats.composition_mismatch_combinations || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-danger">
            🚨 Insumos o Mano de Obra distorsinados
          </span>
        </div>
      </div>

      <div className="kpi-card amber">
        <div className="kpi-label">Variación Extrema de Precios</div>
        <div className="kpi-value">{(stats.price_variation_combinations || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-warning">
            💸 Diferencia mayor a $5 MXN en mismo paquete
          </span>
        </div>
      </div>

      <div className="kpi-card purple">
        <div className="kpi-label">Creaciones Locales</div>
        <div className="kpi-value">{(stats.local_creations_packages || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-purple">
            Exclusivos de 1 sola agencia (Córdoba / Juchitán)
          </span>
        </div>
      </div>
    </div>
  );
}
