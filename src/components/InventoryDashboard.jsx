import React, { useState, useEffect } from 'react';
import { BarChart3, Building2, AlertTriangle, RefreshCw, Car, AlertCircle } from 'lucide-react';
import GlobalInventoryCounter from './inventory/GlobalInventoryCounter';
import InventoryKPICards from './inventory/InventoryKPICards';
import InventoryByAgency from './inventory/InventoryByAgency';
import InventoryServiceAlert from './inventory/InventoryServiceAlert';
import InventorySeminuevos from './inventory/InventorySeminuevos';

export default function InventoryDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('RESUMEN');

  useEffect(() => {
    fetch('/inventory_data.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el inventario');
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <h2 style={{ color: 'var(--nissan-red)', fontWeight: '800' }}>Cargando Inventario de Unidades...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="section-card" style={{ borderColor: 'var(--status-danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--status-danger)', marginBottom: '0.5rem' }}>
            <AlertCircle size={24} />
            <h2 style={{ fontWeight: '800' }}>Error al Cargar Datos</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const { summary } = data;

  const tabs = [
    { id: 'RESUMEN',   label: 'Resumen Grupo',           icon: BarChart3, badge: `${summary.total_vehicles} Unidades` },
    { id: 'AGENCIAS',  label: 'Por Agencia',             icon: Building2, badge: `${data.agencies.length} Sucursales` },
    { id: 'ALERTAS',   label: 'Alerta Servicios +90d',   icon: AlertTriangle, badge: summary.total_pending, danger: true },
    { id: 'USADOS',    label: 'Seminuevos / Intercambio', icon: RefreshCw, badge: summary.total_used },
  ];

  return (
    <div>
      {/* Executive Global Group Counter Bar */}
      <GlobalInventoryCounter data={data} />

      {/* Tabs */}
      <nav className="tabs-nav">
        {tabs.map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComp size={15} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
              <span
                className="tab-badge"
                style={{
                  background: activeTab === tab.id
                    ? 'rgba(255,255,255,0.3)'
                    : tab.danger ? 'var(--nissan-red)' : 'var(--status-info)',
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </nav>

      <main>
        {activeTab === 'RESUMEN'  && <InventoryKPICards data={data} />}
        {activeTab === 'AGENCIAS' && <InventoryByAgency data={data} />}
        {activeTab === 'ALERTAS'  && <InventoryServiceAlert data={data} />}
        {activeTab === 'USADOS'   && <InventorySeminuevos data={data} />}
      </main>
    </div>
  );
}
