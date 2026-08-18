import React, { useState } from 'react';

export default function ServicesMatrixTab({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  if (!data || !data.packages) return null;

  const agencies = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC'];
  const agencyNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  const filteredPackages = data.packages.filter(pkg => {
    const matchesSearch =
      pkg.numpaq.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.primary_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'STANDARDIZED') return pkg.agency_count === 6;
    if (filterType === 'PARTIAL') return pkg.agency_count > 1 && pkg.agency_count < 6;
    if (filterType === 'LOCAL') return pkg.agency_count === 1;

    return true;
  });

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">📊 Matriz Completa de Paquetes por Agencia ({data.packages.length} Paquetes Únicos)</h2>
          <p className="subtitle">
            Rejilla máster de paquetes de servicio registrados en el grupo Gasme Automotriz y su disponibilidad en cada una de las 6 agencias.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="filter-pills" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          <button
            className={`btn-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            📋 Todos ({data.packages.length})
          </button>
          <button
            className={`btn-pill ${filterType === 'STANDARDIZED' ? 'active' : ''}`}
            onClick={() => setFilterType('STANDARDIZED')}
          >
            ✅ Estandarizados en 6 Agencias ({data.packages.filter(p => p.agency_count === 6).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'PARTIAL' ? 'active' : ''}`}
            onClick={() => setFilterType('PARTIAL')}
          >
            ⚠️ Faltantes en alguna Agencia ({data.packages.filter(p => p.agency_count > 1 && p.agency_count < 6).length})
          </button>
          <button
            className={`btn-pill ${filterType === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterType('LOCAL')}
          >
            🟣 Creaciones Locales ({data.packages.filter(p => p.agency_count === 1).length})
          </button>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar paquete por código o nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código Paquete</th>
              <th>Descripción del Paquete</th>
              <th style={{ textAlign: 'center' }}>Modelos / Líneas</th>
              {agencies.map(b => (
                <th key={b} style={{ textAlign: 'center' }}>
                  {agencyNames[b]}
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>Estado / Coincidencia</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg, idx) => (
              <tr key={idx}>
                <td className="code-cell" style={{ fontWeight: '700' }}>
                  {pkg.numpaq}
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {pkg.primary_name}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-nissan" style={{ fontSize: '0.75rem' }}>
                    {pkg.line_count} modelos
                  </span>
                </td>
                {agencies.map(b => {
                  const isPresent = pkg.presence[b];
                  return (
                    <td key={b} style={{ textAlign: 'center' }}>
                      {isPresent ? (
                        <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>✓</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>—</span>
                      )}
                    </td>
                  );
                })}
                <td style={{ textAlign: 'center' }}>
                  {pkg.agency_count === 6 ? (
                    <span className="badge badge-success">6/6 Agencias</span>
                  ) : pkg.agency_count === 1 ? (
                    <span className="badge badge-purple">🟣 Local (1/6)</span>
                  ) : (
                    <span className="badge badge-warning">{pkg.agency_count}/6 Agencias</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
