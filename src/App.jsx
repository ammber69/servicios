import React, { useState, useEffect } from 'react';
import SummaryCards from './components/SummaryCards';
import CategoryComparisonTable from './components/CategoryComparisonTable';
import CatalogMatrixTable from './components/CatalogMatrixTable';
import DiscrepancyAudit from './components/DiscrepancyAudit';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('AUDIT');

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
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--nissan-red)' }}>⚙️</div>
          <h2 style={{ fontWeight: '800', color: 'var(--nissan-red)' }}>Cargando Catálogos de las 6 Agencias Nissan...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Procesando 12,746 registros de servicio de Gasme Automotriz</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="section-card" style={{ borderColor: 'var(--nissan-red)' }}>
          <h2 style={{ color: 'var(--nissan-red)', marginBottom: '1rem' }}>❌ Error de Carga</h2>
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
            <span className="brand-badge">NISSAN</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              GASME AUTOMOTRIZ • Módulo CRM de Estandarización de Servicios
            </span>
          </div>
          <h1 className="main-title" style={{ marginTop: '0.4rem' }}>
            Comparativo y Auditoría de Catálogos de Trabajo
          </h1>
          <p className="subtitle">
            Diagnóstico para directivos y gerencia: Homologación entre Córdoba, Juchitán, Orizaba, Salina Cruz, Tierra Blanca y Tuxtepec.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-nissan" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            🔴 6 Agencias Analizadas
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            🟣 2,223 Códigos Únicos
          </span>
        </div>
      </header>

      {/* KPI Executive Summary */}
      <SummaryCards data={data} />

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          ⚠️ Auditoría de Inconsistencias y Creaciones Locales
          <span className="tab-badge" style={{ background: activeTab === 'AUDIT' ? 'rgba(255,255,255,0.3)' : 'var(--nissan-red)' }}>
            {(data?.stats?.local_creations || 83) + (data?.stats?.critical_collisions || 131)}
          </span>
        </button>

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
      </nav>

      {/* Tab Content */}
      <main>
        {activeTab === 'AUDIT' && <DiscrepancyAudit data={data} />}
        {activeTab === 'SUMMARY' && <CategoryComparisonTable data={data} />}
        {activeTab === 'MATRIX' && <CatalogMatrixTable data={data} />}
      </main>
    </div>
  );
}

export default App;
