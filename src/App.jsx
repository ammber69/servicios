import React, { useState, useEffect } from 'react';
// Jobs Components
import SummaryCards from './components/SummaryCards';
import CategoryComparisonTable from './components/CategoryComparisonTable';
import CatalogMatrixTable from './components/CatalogMatrixTable';
import DiscrepancyAudit from './components/DiscrepancyAudit';

// Services Components
import ServicesSummaryCards from './components/services/ServicesSummaryCards';
import ServicesAuditTab from './components/services/ServicesAuditTab';
import ServicesModelComparerTab from './components/services/ServicesModelComparerTab';
import ServicesMatrixTab from './components/services/ServicesMatrixTab';

// Inventory Component
import InventoryDashboard from './components/InventoryDashboard';

function App() {
  const [activeModule, setActiveModule] = useState('SERVICIOS'); // 'TRABAJOS' or 'SERVICIOS'

  // Jobs data
  const [jobsData, setJobsData] = useState(null);
  // Services data
  const [servicesData, setServicesData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active sub-tabs
  const [activeJobsTab, setActiveJobsTab] = useState('AUDIT');
  const [activeServicesTab, setActiveServicesTab] = useState('AUDIT');

  useEffect(() => {
    Promise.all([
      fetch('/catalogs_data.json').then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo de trabajos');
        return res.json();
      }),
      fetch('/services_data.json').then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo de servicios');
        return res.json();
      })
    ])
      .then(([jData, sData]) => {
        setJobsData(jData);
        setServicesData(sData);
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
          <h2 style={{ fontWeight: '800', color: 'var(--nissan-red)' }}>Cargando Catálogos y Paquetes de Servicio Nissan...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Procesando 34,994 registros de Paquetes y 12,746 registros de Trabajos (Gasme Automotriz)</p>
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
      {/* App Header */}
      <header className="app-header">
        <div>
          <div className="brand-title">
            <span className="brand-badge">NISSAN</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              GASME AUTOMOTRIZ • Módulo CRM de Estandarización
            </span>
          </div>
          <h1 className="main-title" style={{ marginTop: '0.4rem' }}>
            {activeModule === 'SERVICIOS' ? 'Análisis y Auditoría de Paquetes de Servicio'
              : activeModule === 'TRABAJOS' ? 'Comparativo y Auditoría de Catálogos de Trabajo'
              : 'Dashboard de Inventario de Unidades — Gasme Automotriz'}
          </h1>
          <p className="subtitle">
            Diagnóstico para directivos y gerencia: Homologación entre Córdoba, Juchitán, Orizaba, Salina Cruz, Tierra Blanca y Tuxtepec.
          </p>
        </div>

        {/* Top-Level Module Switcher */}
        <div className="module-switcher-container">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem', textAlign: 'right' }}>
            MÓDULO ACTIVO:
          </div>
          <div className="module-switcher">
            <button
              className={`module-btn ${activeModule === 'SERVICIOS' ? 'active' : ''}`}
              onClick={() => setActiveModule('SERVICIOS')}
            >
              📦 Paquetes de Servicio
              <span className="module-badge">64 Combos</span>
            </button>
            <button
              className={`module-btn ${activeModule === 'TRABAJOS' ? 'active' : ''}`}
              onClick={() => setActiveModule('TRABAJOS')}
            >
              🛠️ Catálogo de Trabajos
              <span className="module-badge">2,223 Únicos</span>
            </button>
            <button
              className={`module-btn ${activeModule === 'INVENTARIO' ? 'active' : ''}`}
              onClick={() => setActiveModule('INVENTARIO')}
            >
              🚗 Inventario de Unidades
              <span className="module-badge">867 Vehículos</span>
            </button>
          </div>
        </div>
      </header>

      {/* Module Content */}
      {activeModule === 'SERVICIOS' && (
        <>
          {/* Services KPI Cards */}
          <ServicesSummaryCards data={servicesData} />

          {/* Services Sub-Tabs */}
          <nav className="tabs-nav">
            <button
              className={`tab-btn ${activeServicesTab === 'AUDIT' ? 'active' : ''}`}
              onClick={() => setActiveServicesTab('AUDIT')}
            >
              ⚠️ Auditoría de Inconsistencias y Causa Raíz
              <span className="tab-badge" style={{ background: activeServicesTab === 'AUDIT' ? 'rgba(255,255,255,0.3)' : 'var(--nissan-red)' }}>
                {(servicesData?.stats?.composition_mismatch_combinations || 165) + (servicesData?.stats?.local_creations_packages || 4)}
              </span>
            </button>

            <button
              className={`tab-btn ${activeServicesTab === 'MODEL_COMPARE' ? 'active' : ''}`}
              onClick={() => setActiveServicesTab('MODEL_COMPARE')}
            >
              🚗 Comparativo por Modelo / Línea de Auto
            </button>

            <button
              className={`tab-btn ${activeServicesTab === 'MATRIX' ? 'active' : ''}`}
              onClick={() => setActiveServicesTab('MATRIX')}
            >
              📊 Matriz Completa por Paquete (64)
            </button>
          </nav>

          <main>
            {activeServicesTab === 'AUDIT' && <ServicesAuditTab data={servicesData} />}
            {activeServicesTab === 'MODEL_COMPARE' && <ServicesModelComparerTab data={servicesData} />}
            {activeServicesTab === 'MATRIX' && <ServicesMatrixTab data={servicesData} />}
          </main>
        </>
      )}

      {activeModule === 'TRABAJOS' && (
        <>
          {/* Jobs KPI Executive Summary */}
          <SummaryCards data={jobsData} />

          {/* Jobs Navigation Tabs */}
          <nav className="tabs-nav">
            <button
              className={`tab-btn ${activeJobsTab === 'AUDIT' ? 'active' : ''}`}
              onClick={() => setActiveJobsTab('AUDIT')}
            >
              ⚠️ Auditoría de Inconsistencias y Creaciones Locales
              <span className="tab-badge" style={{ background: activeJobsTab === 'AUDIT' ? 'rgba(255,255,255,0.3)' : 'var(--nissan-red)' }}>
                {(jobsData?.stats?.local_creations || 83) + (jobsData?.stats?.critical_collisions || 131)}
              </span>
            </button>

            <button
              className={`tab-btn ${activeJobsTab === 'SUMMARY' ? 'active' : ''}`}
              onClick={() => setActiveJobsTab('SUMMARY')}
            >
              📊 Conteo por Categoría y Zona
            </button>

            <button
              className={`tab-btn ${activeJobsTab === 'MATRIX' ? 'active' : ''}`}
              onClick={() => setActiveJobsTab('MATRIX')}
            >
              🔍 Matriz Completa por Código (2,223)
            </button>
          </nav>

          {/* Jobs Tab Content */}
          <main>
            {activeJobsTab === 'AUDIT' && <DiscrepancyAudit data={jobsData} />}
            {activeJobsTab === 'SUMMARY' && <CategoryComparisonTable data={jobsData} />}
            {activeJobsTab === 'MATRIX' && <CatalogMatrixTable data={jobsData} />}
          </main>
        </>
      )}

      {/* Inventory Module */}
      {activeModule === 'INVENTARIO' && <InventoryDashboard />}
    </div>
  );
}

export default App;
