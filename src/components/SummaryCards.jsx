import React from 'react';

export default function SummaryCards({ data }) {
  if (!data) return null;

  const totalCodes = data.total_codes || 0;
  const stats = data.stats || {};

  return (
    <div className="kpi-grid">
      <div className="kpi-card blue">
        <div className="kpi-label">Catálogo Maestro Global</div>
        <div className="kpi-value">{totalCodes.toLocaleString()}</div>
        <div className="kpi-sub">
          <span>Códigos de trabajo registrados a nivel grupo</span>
        </div>
      </div>

      <div className="kpi-card emerald">
        <div className="kpi-label">Estandarizados 100%</div>
        <div className="kpi-value">{(stats.fully_standardized || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-success">
            {(((stats.fully_standardized || 0) / totalCodes) * 100).toFixed(1)}% Coincidencia
          </span>
          <span>en las 6 agencias</span>
        </div>
      </div>

      <div className="kpi-card rose">
        <div className="kpi-label">Colisiones Críticas</div>
        <div className="kpi-value">{(stats.critical_collisions || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-danger">
            🚨 Mismo código, trabajos totalmente distintos
          </span>
        </div>
      </div>

      <div className="kpi-card amber">
        <div className="kpi-label">Variantes Ortográficas</div>
        <div className="kpi-value">{(stats.minor_typos || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-warning">
            ✏️ Pequeños cambios de redacción
          </span>
        </div>
      </div>

      <div className="kpi-card purple">
        <div className="kpi-label">Creaciones Locales</div>
        <div className="kpi-value">{(stats.local_creations || 0).toLocaleString()}</div>
        <div className="kpi-sub">
          <span className="badge badge-purple">
            Exclusivos de 1 sola agencia
          </span>
        </div>
      </div>
    </div>
  );
}
