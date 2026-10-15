import React, { useState, useEffect } from 'react';
import { Package, Wrench, Car } from 'lucide-react';

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
          <div className="loading-spinner"></div>
          <h2 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Cargando Catálogos y Paquetes de Servicio</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Procesando 34,995 registros de Paquetes y 12,647 registros de Trabajos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="section-card" style={{ borderColor: 'var(--status-danger)' }}>
          <h2 style={{ color: 'var(--status-danger)', marginBottom: '1rem', fontWeight: '800' }}>Error de Carga</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Brand Bar & Global Search */}
      <header className="executive-top-header">
        <div className="brand-title">
          <img src="/logo-sucursal.png" alt="Logo Sucursal" className="brand-logo" />
          <span className="brand-badge-nissan">NISSAN</span>
          <span className="brand-company-name">GASME AUTOMOTRIZ</span>
        </div>

        <div className="executive-global-search">
          <input
            type="text"
            className="executive-top-search-input"
            placeholder="Buscar por código, paquete o auto..."
            readOnly
            onClick={() => {
              const el = document.querySelector('.executive-search-input, .search-input');
              if (el) el.focus();
            }}
          />
        </div>
      </header>

      {/* Main Editorial Headline */}
      <div className="executive-hero-headline">
        <h1 className="editorial-main-title">
          {activeModule === 'SERVICIOS' ? 'Análisis y Auditoría de Paquetes de Servicio'
            : activeModule === 'TRABAJOS' ? 'Comparativo y Auditoría de Catálogos de Trabajo'
            : 'Control Estratégico de Inventario de Unidades'}
        </h1>
        <p className="editorial-subtitle">
          {activeModule === 'SERVICIOS' ? 'Identificación de discrepancias operativas, combos incompletos y variaciones de precio entre agencias.'
            : activeModule === 'TRABAJOS' ? 'Diagnóstico directivo: Homologación de códigos, creaciones locales y colisiones críticas en las 6 agencias.'
            : 'Supervisión en tiempo real de unidades en patio, semáforo de servicios preventivos y seminuevos.'}
        </p>
      </div>

      {/* Executive Module Navigation Pills (Mockup Style) */}
      <div className="executive-module-nav">
        <button
          className={`executive-module-pill ${activeModule === 'SERVICIOS' ? 'active' : ''}`}
          onClick={() => setActiveModule('SERVICIOS')}
        >
          <Package size={15} />
          <span>Paquetes ({servicesData?.total_package_codes || 64})</span>
        </button>

        <button
          className={`executive-module-pill ${activeModule === 'TRABAJOS' ? 'active' : ''}`}
          onClick={() => setActiveModule('TRABAJOS')}
        >
          <Wrench size={15} />
          <span>Catálogo ({(catalogsData?.total_codes || 2223).toLocaleString()})</span>
        </button>

        <button
          className={`executive-module-pill ${activeModule === 'INVENTARIO' ? 'active' : ''}`}
          onClick={() => setActiveModule('INVENTARIO')}
        >
          <Car size={15} />
          <span>Inventario (963)</span>
        </button>
      </div>

      {/* Module Content Container */}
      <div key={activeModule} className="apple-module-view">
        {activeModule === 'SERVICIOS' && (
          <>
            {/* Services KPI Executive Banner */}
            <ServicesSummaryCards data={servicesData} />

            {/* Services Sub-Tabs */}
            <nav className="tabs-nav" role="tablist" aria-label="Navegación de Paquetes de Servicio">
              <button
                className={`tab-btn ${activeServicesTab === 'AUDIT' ? 'active' : ''}`}
                onClick={() => setActiveServicesTab('AUDIT')}
                role="tab"
                aria-selected={activeServicesTab === 'AUDIT'}
              >
                Auditoría de Inconsistencias y Causa Raíz
                <span className="tab-badge" style={{ background: activeServicesTab === 'AUDIT' ? 'rgba(255,255,255,0.3)' : 'var(--nissan-red)' }}>
                  {(servicesData?.stats?.composition_mismatch_combinations || 165) + (servicesData?.stats?.local_creations_packages || 4)}
                </span>
              </button>

              <button
                className={`tab-btn ${activeServicesTab === 'MODEL_COMPARE' ? 'active' : ''}`}
                onClick={() => setActiveServicesTab('MODEL_COMPARE')}
                role="tab"
                aria-selected={activeServicesTab === 'MODEL_COMPARE'}
              >
                Comparativo por Modelo / Línea de Auto
              </button>

              <button
                className={`tab-btn ${activeServicesTab === 'MATRIX' ? 'active' : ''}`}
                onClick={() => setActiveServicesTab('MATRIX')}
                role="tab"
                aria-selected={activeServicesTab === 'MATRIX'}
              >
                Matriz Completa por Paquete (64)
              </button>
            </nav>

            <main key={activeServicesTab} className="apple-tab-content">
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
            <nav className="tabs-nav" role="tablist" aria-label="Navegación de Catálogo de Trabajos">
              <button
                className={`tab-btn ${activeJobsTab === 'AUDIT' ? 'active' : ''}`}
                onClick={() => setActiveJobsTab('AUDIT')}
                role="tab"
                aria-selected={activeJobsTab === 'AUDIT'}
              >
                Auditoría de Inconsistencias y Creaciones Locales
                <span className="tab-badge" style={{ background: activeJobsTab === 'AUDIT' ? 'rgba(255,255,255,0.3)' : 'var(--nissan-red)' }}>
                  {(jobsData?.stats?.local_creations || 83) + (jobsData?.stats?.critical_collisions || 131)}
                </span>
              </button>

              <button
                className={`tab-btn ${activeJobsTab === 'SUMMARY' ? 'active' : ''}`}
                onClick={() => setActiveJobsTab('SUMMARY')}
                role="tab"
                aria-selected={activeJobsTab === 'SUMMARY'}
              >
                Conteo por Categoría y Zona
              </button>

              <button
                className={`tab-btn ${activeJobsTab === 'MATRIX' ? 'active' : ''}`}
                onClick={() => setActiveJobsTab('MATRIX')}
                role="tab"
                aria-selected={activeJobsTab === 'MATRIX'}
              >
                Matriz Completa por Código (2,223)
              </button>
            </nav>

            {/* Jobs Tab Content */}
            <main key={activeJobsTab} className="apple-tab-content">
              {activeJobsTab === 'AUDIT' && <DiscrepancyAudit data={jobsData} />}
              {activeJobsTab === 'SUMMARY' && <CategoryComparisonTable data={jobsData} />}
              {activeJobsTab === 'MATRIX' && <CatalogMatrixTable data={jobsData} />}
            </main>
          </>
        )}

        {/* Inventory Module */}
        {activeModule === 'INVENTARIO' && (
          <div className="apple-tab-content">
            <InventoryDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
