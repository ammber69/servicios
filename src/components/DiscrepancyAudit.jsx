import React, { useState, useMemo } from 'react';

export default function DiscrepancyAudit({ data }) {
  if (!data) return null;

  const branches = data.branches || [];
  const matrix = data.code_matrix || [];
  const stats = data.stats || {};

  const [activeSubTab, setActiveSubTab] = useState('LOCAL_CREATED');
  const [missingFilter, setMissingFilter] = useState('ALL_MISSING');
  const [showAllLocal, setShowAllLocal] = useState(true); // Default to showing all local jobs for executives!
  const [localViewMode, setLocalViewMode] = useState('GRID'); // GRID or TABLE

  const branchDisplayNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  const criticalCollisions = useMemo(() => matrix.filter(item => item.severity === 'CRITICAL_COLLISION'), [matrix]);
  const minorTypos = useMemo(() => matrix.filter(item => item.severity === 'TYPO'), [matrix]);
  const localJobs = useMemo(() => matrix.filter(item => item.missing_count === 5), [matrix]);

  const missingJobs = useMemo(() => {
    return matrix.filter(item => {
      if (item.missing_count === 0) return false;
      if (missingFilter === 'MISSING_1') return item.missing_count === 1;
      if (missingFilter === 'MISSING_2_4') return item.missing_count >= 2 && item.missing_count <= 4;
      if (missingFilter === 'MISSING_5') return item.missing_count === 5;
      return true;
    });
  }, [matrix, missingFilter]);

  const localJobsByBranch = useMemo(() => {
    const map = {};
    branches.forEach(b => {
      map[b] = localJobs.filter(item => item.presence[b]);
    });
    return map;
  }, [branches, localJobs]);

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">⚠️ Auditoría para la Estandarización del Catálogo Maestro</h2>
          <p className="subtitle">
            Herramienta de diagnóstico completo: detecta trabajos faltantes por zona, colisiones de código y diferencias de nombre.
          </p>
        </div>
      </div>

      {/* Sub-tabs for Audit */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeSubTab === 'LOCAL_CREATED' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('LOCAL_CREATED')}
        >
          🟣 Creaciones Locales ({localJobs.length})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'CRITICAL_COLLISIONS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('CRITICAL_COLLISIONS')}
        >
          🚨 Colisiones Críticas ({criticalCollisions.length})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'MISSING_ALL' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MISSING_ALL')}
        >
          🟡 Faltantes por Zona ({stats.missing_at_least_1 || 345})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'TYPOS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('TYPOS')}
        >
          ✏️ Diferencias Ortográficas ({minorTypos.length})
        </button>
      </div>

      {/* Sub-tab 1: Local Created Jobs */}
      {activeSubTab === 'LOCAL_CREATED' && (
        <div>
          <div style={{
            backgroundColor: '#f3e8ff',
            border: '1px solid #ddd6fe',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ color: '#6d28d9', fontSize: '1rem', fontWeight: '800', marginBottom: '0.2rem' }}>
                🟣 Catálogo Completo de Creaciones Locales ({localJobs.length} Trabajos)
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                Estos trabajos fueron creados de forma autogestionada por los usuarios en sucursales específicas y no existen en el catálogo maestro del resto del grupo.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className={`btn-nissan ${showAllLocal ? '' : 'btn-outline'}`}
                onClick={() => setShowAllLocal(!showAllLocal)}
                style={{ backgroundColor: showAllLocal ? '#6d28d9' : 'transparent', borderColor: '#6d28d9', color: showAllLocal ? 'white' : '#6d28d9' }}
              >
                {showAllLocal ? '✓ Desglosados Todos (83)' : '👁️ Desglosar Todos los Trabajos'}
              </button>

              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button
                  className="page-btn"
                  style={{
                    borderRadius: 0,
                    backgroundColor: localViewMode === 'GRID' ? '#6d28d9' : 'white',
                    color: localViewMode === 'GRID' ? 'white' : 'var(--text-primary)',
                    border: 'none'
                  }}
                  onClick={() => setLocalViewMode('GRID')}
                >
                  🗂️ Vista por Sucursales
                </button>
                <button
                  className="page-btn"
                  style={{
                    borderRadius: 0,
                    backgroundColor: localViewMode === 'TABLE' ? '#6d28d9' : 'white',
                    color: localViewMode === 'TABLE' ? 'white' : 'var(--text-primary)',
                    border: 'none'
                  }}
                  onClick={() => setLocalViewMode('TABLE')}
                >
                  📋 Tabla Unificada Directiva
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE: TABLE */}
          {localViewMode === 'TABLE' ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>No. Tra</th>
                    <th>Descripción del Trabajo Local</th>
                    <th>Sucursal Creadora</th>
                    <th>Categoría / Depto</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  {localJobs.map((item, idx) => {
                    const creatorBranchKey = branches.find(b => item.presence[b]);
                    const creatorBranchName = branchDisplayNames[creatorBranchKey] || creatorBranchKey;
                    const deptosUsed = Object.values(item.deptos).filter(Boolean);

                    return (
                      <tr key={idx}>
                        <td className="code-cell" style={{ color: '#6d28d9' }}>{item.code}</td>
                        <td style={{ fontWeight: '600' }}>{item.main_desc}</td>
                        <td>
                          <span className="badge badge-purple">
                            📍 {creatorBranchName}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {deptosUsed[0] || 'SIN DEPARTAMENTO'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-warning">Evaluar para Grupo</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE: GRID */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {branches.map(b => {
                const list = localJobsByBranch[b] || [];
                const displayList = showAllLocal ? list : list.slice(0, 10);

                return (
                  <div
                    key={b}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderTop: list.length > 0 ? '3px solid #7c3aed' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>
                        📍 {branchDisplayNames[b]}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                        {list.length} Trabajos Propios
                      </span>
                    </div>

                    {list.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                        Sin creaciones locales registradas.
                      </p>
                    ) : (
                      <div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
                          {displayList.map((item, idx) => (
                            <li
                              key={idx}
                              style={{
                                padding: '0.5rem 0',
                                borderBottom: idx < displayList.length - 1 ? '1px dashed var(--border-color)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                alignItems: 'flex-start'
                              }}
                            >
                              <span className="code-cell" style={{ fontSize: '0.8rem', minWidth: '45px', color: '#6d28d9' }}>
                                {item.code}
                              </span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: '500', flex: 1, textAlign: 'right' }}>
                                {item.main_desc}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {!showAllLocal && list.length > 10 && (
                          <button
                            className="btn-outline"
                            onClick={() => setShowAllLocal(true)}
                            style={{
                              width: '100%',
                              marginTop: '0.75rem',
                              padding: '0.4rem',
                              fontSize: '0.8rem',
                              borderColor: '#7c3aed',
                              color: '#7c3aed'
                            }}
                          >
                            + Desglosar {list.length - 10} trabajos más en esta agencia
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Critical Collisions */}
      {activeSubTab === 'CRITICAL_COLLISIONS' && (
        <div>
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ color: '#b91c1c', fontSize: '1rem', fontWeight: '800', marginBottom: '0.3rem' }}>
              🚨 ¡Atención! Se detectaron {criticalCollisions.length} colisiones de código críticas
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              En estos casos, <strong>el mismo número de código se utilizó para SERVICIOS COMPLETAMENTE DIFERENTES</strong> entre agencias (ej. <code>A53</code> = Cambio de Aceite en 5 agencias vs. Reparar Tolva en Orizaba).
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>No. Tra</th>
                  <th>Estándar Sugerido (Mayoría 5 Agencias)</th>
                  <th>Discrepancia / Sucursal Conflictiva</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Acción CRM</th>
                </tr>
              </thead>
              <tbody>
                {criticalCollisions.map((item, idx) => (
                  <tr key={idx}>
                    <td className="code-cell" style={{ color: 'var(--nissan-red)', fontWeight: 'bold' }}>
                      {item.code}
                    </td>
                    <td>
                      <strong style={{ color: '#15803d' }}>{item.proposed_standard}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {Object.entries(item.descriptions)
                          .filter(([_, d]) => d && d !== item.proposed_standard)
                          .map(([b, d]) => (
                            <div key={b} style={{ fontSize: '0.85rem' }}>
                              <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>
                                {branchDisplayNames[b]}:
                              </span>
                              <span style={{ color: '#b91c1c', fontWeight: '600' }}>{d}</span>
                            </div>
                          ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-warning">Reasignar Código</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Missing Jobs Breakdown */}
      {activeSubTab === 'MISSING_ALL' && (
        <div>
          <div style={{
            backgroundColor: '#ffedd5',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ color: '#c2410c', fontSize: '1rem', fontWeight: '800', marginBottom: '0.2rem' }}>
                📋 Desglose Completo de Trabajos Faltantes por Sucursal
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                Hay un total de <strong>{stats.missing_at_least_1 || 345} trabajos</strong> que no existen en la totalidad de las 6 agencias (faltan en al menos 1 sucursal).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Filtrar por nivel:</span>
              <select
                className="select-filter"
                value={missingFilter}
                onChange={(e) => setMissingFilter(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="ALL_MISSING">Todos los Faltantes ({stats.missing_at_least_1 || 345})</option>
                <option value="MISSING_1">Falta en 1 sola agencia ({stats.missing_1_branch || 255})</option>
                <option value="MISSING_2_4">Falta en 2 a 4 agencias ({ (stats.missing_2_branches||0) + (stats.missing_3_branches||0) + (stats.missing_4_branches||0) })</option>
                <option value="MISSING_5">Falta en 5 agencias / Exclusivos ({stats.missing_5_branches || 83})</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>No. Tra</th>
                  <th>Descripción del Servicio</th>
                  <th>Presente En (🟢)</th>
                  <th>Falta En (🔴)</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Estatus Coincidencia</th>
                </tr>
              </thead>
              <tbody>
                {missingJobs.map((item, idx) => (
                  <tr key={idx}>
                    <td className="code-cell">{item.code}</td>
                    <td style={{ fontWeight: '600' }}>{item.proposed_standard}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {item.present_branches.map(b => (
                          <span key={b} className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            {branchDisplayNames[b]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {item.missing_branches.map(b => (
                          <span key={b} className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                            {branchDisplayNames[b]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-warning">
                        {item.presence_count} / 6 Agencias
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Minor Typos */}
      {activeSubTab === 'TYPOS' && (
        <div>
          <div style={{
            backgroundColor: '#ffedd5',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ color: '#c2410c', fontSize: '1rem', fontWeight: '800', marginBottom: '0.3rem' }}>
              ✏️ {minorTypos.length} Variantes Ortográficas o Sintácticas
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              El trabajo corresponde al mismo servicio, pero existen ligeras variaciones de redacción entre agencias (ej. <code>VUELVA</code> vs <code>VUELVE</code>).
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>No. Tra</th>
                  <th>Nombre Estándar Propuesto</th>
                  <th>Variantes por Agencia</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Acción CRM</th>
                </tr>
              </thead>
              <tbody>
                {minorTypos.map((item, idx) => (
                  <tr key={idx}>
                    <td className="code-cell">{item.code}</td>
                    <td>
                      <strong style={{ color: 'var(--nissan-red)' }}>{item.proposed_standard}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                        {Object.entries(item.descriptions)
                          .filter(([_, d]) => d)
                          .map(([b, d]) => (
                            <div key={b}>
                              • <span style={{ color: 'var(--text-muted)' }}>{branchDisplayNames[b]}:</span> {d}
                            </div>
                          ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">Homologar Texto</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
