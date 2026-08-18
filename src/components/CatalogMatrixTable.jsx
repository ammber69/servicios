import React, { useState, useMemo } from 'react';

export default function CatalogMatrixTable({ data }) {
  const branches = useMemo(() => data?.branches || [], [data]);
  const matrix = useMemo(() => data?.code_matrix || [], [data]);

  const branchDisplayNames = {
    CORDOBA: 'COR',
    JUCHITAN: 'JUC',
    ORIZABA: 'ORI',
    SALINA_CRUZ: 'SAL',
    TIERRA_BLANCA: 'TIE',
    TUXTEPEC: 'TUX'
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [deptoFilter, setDeptoFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const deptosList = useMemo(() => {
    const set = new Set();
    matrix.forEach(item => {
      Object.values(item.deptos).forEach(d => {
        if (d) set.add(d);
      });
    });
    return Array.from(set).sort();
  }, [matrix]);

  const filteredMatrix = useMemo(() => {
    return matrix.filter(item => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const codeMatch = item.code.toLowerCase().includes(query);
        const descMatch = item.main_desc.toLowerCase().includes(query);
        const altDescsMatch = Object.values(item.descriptions).some(d =>
          d.toLowerCase().includes(query)
        );
        if (!codeMatch && !descMatch && !altDescsMatch) return false;
      }

      if (statusFilter === 'CRITICAL_COLLISION' && item.severity !== 'CRITICAL_COLLISION') return false;
      if (statusFilter === 'TYPO' && item.severity !== 'TYPO') return false;
      if (statusFilter === 'STANDARD' && item.severity !== 'STANDARD') return false;
      if (statusFilter === 'LOCAL' && item.severity !== 'LOCAL') return false;
      if (statusFilter === 'MISSING_SOME' && item.severity !== 'MISSING_SOME') return false;

      if (branchFilter !== 'ALL') {
        if (branchFilter.startsWith('PRESENT_')) {
          const b = branchFilter.replace('PRESENT_', '');
          if (!item.presence[b]) return false;
        } else if (branchFilter.startsWith('MISSING_')) {
          const b = branchFilter.replace('MISSING_', '');
          if (item.presence[b]) return false;
        }
      }

      if (deptoFilter !== 'ALL') {
        const hasDepto = Object.values(item.deptos).includes(deptoFilter);
        if (!hasDepto) return false;
      }

      return true;
    });
  }, [matrix, searchTerm, statusFilter, branchFilter, deptoFilter]);

  const totalPages = Math.ceil(filteredMatrix.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMatrix.slice(start, start + itemsPerPage);
  }, [filteredMatrix, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!data) return null;

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">🔍 Matriz Comparativa de Códigos de Trabajo (2,223 Códigos)</h2>
          <p className="subtitle">
            Explora código por código la presencia, diferencias de nombre y estatus de conflicto entre las 6 agencias.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Mostrando <strong>{filteredMatrix.length.toLocaleString()}</strong> de <strong>{matrix.length.toLocaleString()}</strong> trabajos
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por Código de Trabajo (No. Tra) o Descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="select-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">-- Gravedad de Conflicto --</option>
          <option value="CRITICAL_COLLISION">🚨 Colisiones Críticas (131)</option>
          <option value="TYPO">✏️ Variantes Ortográficas (73)</option>
          <option value="STANDARD">🟢 Estandarizados (1,806)</option>
          <option value="LOCAL">🟣 Creaciones Locales (83)</option>
          <option value="MISSING_SOME">🟡 Faltantes Parciales (130)</option>
        </select>

        <select
          className="select-filter"
          value={branchFilter}
          onChange={(e) => {
            setBranchFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">-- Filtrar por Sucursal --</option>
          <option value="MISSING_ORIZABA">Faltante en ORIZABA</option>
          <option value="MISSING_CORDOBA">Faltante en CÓRDOBA</option>
          <option value="MISSING_JUCHITAN">Faltante en JUCHITÁN</option>
          <option value="MISSING_SALINA_CRUZ">Faltante en SALINA CRUZ</option>
          <option value="MISSING_TIERRA_BLANCA">Faltante en TIERRA BLANCA</option>
          <option value="MISSING_TUXTEPEC">Faltante en TUXTEPEC</option>
          <option value="PRESENT_ORIZABA">Presente en ORIZABA</option>
          <option value="PRESENT_CORDOBA">Presente en CÓRDOBA</option>
        </select>

        <select
          className="select-filter"
          value={deptoFilter}
          onChange={(e) => {
            setDeptoFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">-- Departamento / Categoría --</option>
          {deptosList.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>No. Tra</th>
              <th>Descripción Principal / Propuesta</th>
              <th>Categoría / Depto</th>
              <th style={{ textAlign: 'center' }}>Clasificación</th>
              {branches.map(b => (
                <th key={b} style={{ textAlign: 'center', width: '50px' }}>
                  {branchDisplayNames[b] || b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron trabajos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => {
                const deptosUsed = Object.values(item.deptos).filter(Boolean);
                const mainDepto = deptosUsed[0] || 'SIN DEPARTAMENTO';

                return (
                  <tr key={idx}>
                    <td className="code-cell">{item.code}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.proposed_standard}</div>
                      {item.has_naming_discrepancy && (
                        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          <span style={{ color: item.severity === 'CRITICAL_COLLISION' ? '#fb7185' : '#fbbf24', fontWeight: 'bold' }}>
                            {item.severity === 'CRITICAL_COLLISION' ? '🚨 Colisión Crítica:' : '✏️ Variante Ortográfica:'}
                          </span>
                          {Object.entries(item.descriptions)
                            .filter(([_, d]) => d)
                            .map(([b, d]) => (
                              <span key={b} style={{ display: 'block', paddingLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                                • {branchDisplayNames[b]}: {d}
                              </span>
                            ))}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {mainDepto}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.severity === 'STANDARD' && (
                        <span className="badge badge-success">🟢 Estandarizado</span>
                      )}
                      {item.severity === 'CRITICAL_COLLISION' && (
                        <span className="badge badge-danger">🚨 Colisión Crítica</span>
                      )}
                      {item.severity === 'TYPO' && (
                        <span className="badge badge-warning">✏️ Variante</span>
                      )}
                      {item.severity === 'LOCAL' && (
                        <span className="badge badge-purple">🟣 Local</span>
                      )}
                      {item.severity === 'MISSING_SOME' && (
                        <span className="badge badge-muted">🟡 Parcial ({item.presence_count}/6)</span>
                      )}
                    </td>
                    {branches.map(b => (
                      <td key={b} style={{ textAlign: 'center' }}>
                        {item.presence[b] ? (
                          <span className="branch-check yes">✓</span>
                        ) : (
                          <span className="branch-check no">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div>
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ← Anterior
          </button>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
