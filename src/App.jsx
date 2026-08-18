import React, { useState, useEffect } from 'react';
import SummaryCards from './components/SummaryCards';
import CategoryComparisonTable from './components/CategoryComparisonTable';
import CatalogMatrixTable from './components/CatalogMatrixTable';
import DiscrepancyAudit from './components/DiscrepancyAudit';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('SUMMARY');

  useEffect(() => {
    fetch('/catalogs_data.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la base de datos de catálogos');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>Cargando Catálogos de las 6 Agencias...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Procesando 12,746 registros de servicio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="section-card" style={{ borderColor: 'var(--accent-rose)' }}>
          <h2 style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>❌ Error de Carga</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div>
          <div className="brand-title">
            <span className="brand-badge">GASME AUTOMOTRIZ</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Módulo de Diagnóstico de Servicios</span>
          </div>
          <h1 className="main-title">Comparativo y Auditoría de Catálogos de Trabajo</h1>
          <p className="subtitle">
            Análisis de estandarización entre sucursales: Córdoba, Juchitán, Orizaba, Salina Cruz, Tierra Blanca y Tuxtepec.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-success">6 Agencias Analizadas</span>
          <span className="badge badge-purple">2,223 Códigos Únicos</span>
        </div>
      </header>

      {/* KPI Executive Summary */}
      <SummaryCards data={data} />

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'SUMMARY' ? 'active' : ''}`}
          onClick={() => setActiveTab('SUMMARY')}
        >
          📊 Conteo por Categoría y Zona
        </button>
        <button
          className={`tab-btn ${activeTab === 'MATRIX' ? 'active' : ''}`}
          onClick={() => setActiveTab('MATRIX')}
        >
          🔍 Matriz Completa por Código (2,223)
        </button>
        <button
          className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          ⚠️ Auditoría de Inconsistencias
          <span className="tab-badge" style={{ background: 'rgba(244, 63, 94, 0.4)' }}>
            {(data?.code_matrix?.filter(i => i.presence_count === 1).length || 0) + (data?.code_matrix?.filter(i => i.has_naming_discrepancy).length || 0)}
          </span>
        </button>
      </nav>

      {/* Tab Content */}
      <main>
        {activeTab === 'SUMMARY' && <CategoryComparisonTable data={data} />}
        {activeTab === 'MATRIX' && <CatalogMatrixTable data={data} />}
        {activeTab === 'AUDIT' && <DiscrepancyAudit data={data} />}
      </main>
    </div>
  );
}

export default App;
