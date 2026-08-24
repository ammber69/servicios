import React from 'react';
import { Wrench, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({ data }) {
  if (!data) return null;

  const totalCodes = data.total_codes || 0;
  const stats = data.stats || {};
  const standardizedPct = totalCodes ? (((stats.fully_standardized || 0) / totalCodes) * 100).toFixed(1) : 0;

  return (
    <div className="apple-hero-banner">
      <div className="apple-hero-top">
        <div className="apple-primary-metric">
          <div className="apple-metric-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wrench size={15} />
            <span>CATÁLOGO MAESTRO GLOBAL DE TRABAJOS DE SERVICIO</span>
          </div>
          <div className="apple-primary-val-row">
            <span className="apple-primary-val">{totalCodes.toLocaleString()}</span>
            <span className="apple-primary-label">Códigos Únicos Registrados</span>
            <span className="apple-status-pill success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={13} />
              <span>{standardizedPct}% Coincidencia Grupo ({(stats.fully_standardized || 0).toLocaleString()})</span>
            </span>
          </div>
          <p className="apple-primary-sub">
            Auditoría de 12,746 filas de operaciones y conceptos de mano de obra en las 6 agencias del grupo Gasme Automotriz.
          </p>
        </div>
      </div>

      <div className="apple-divider-h"></div>

      <div className="apple-metrics-grid">
        <div className="apple-metric-col">
          <span className="apple-col-title">Estandarizados 100%</span>
          <span className="apple-col-val" style={{ color: 'var(--status-success)' }}>
            {(stats.fully_standardized || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Trabajos idénticos en descripción y código en las 6 agencias.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Colisiones Críticas</span>
          <span className="apple-col-val" style={{ color: 'var(--status-danger)' }}>
            {(stats.critical_collisions || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Mismo código asignado a trabajos totalmente distintos en agencias.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Variantes Ortográficas</span>
          <span className="apple-col-val" style={{ color: 'var(--status-warning)' }}>
            {(stats.minor_typos || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Diferencias menores de redacción o abreviación en el concepto.</span>
        </div>

        <div className="apple-metric-col">
          <span className="apple-col-title">Creaciones Locales</span>
          <span className="apple-col-val" style={{ color: 'var(--status-purple)' }}>
            {(stats.local_creations || 0).toLocaleString()}
          </span>
          <span className="apple-col-desc">Códigos aislados registrados en 1 sola agencia sin homologación.</span>
        </div>
      </div>
    </div>
  );
}
