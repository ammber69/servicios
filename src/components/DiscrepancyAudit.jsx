import React, { useState, useMemo } from 'react';

export default function DiscrepancyAudit({ data }) {
  const branches = useMemo(() => data?.branches || [], [data]);
  const matrix = useMemo(() => data?.code_matrix || [], [data]);
  const stats = useMemo(() => data?.stats || {}, [data]);
  const internalDuplicates = useMemo(() => data?.internal_duplicates || {}, [data]);

  const [activeSubTab, setActiveSubTab] = useState('LOCAL_CREATED');
  const [missingFilter, setMissingFilter] = useState('ALL_MISSING');
  
  // Per-branch expansion states for clean layout control
  const [expandedBranches, setExpandedBranches] = useState({});
  const [localViewMode, setLocalViewMode] = useState('GRID');
  const [duplicateBranchFilter, setDuplicateBranchFilter] = useState('ALL');

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

  const totalInternalDuplicates = useMemo(() => {
    return Object.values(internalDuplicates).reduce((acc, curr) => acc + curr.length, 0);
  }, [internalDuplicates]);

  if (!data) return null;

  const toggleBranchExpand = (b) => {
    setExpandedBranches(prev => ({
      ...prev,
      [b]: !prev[b]
    }));
  };

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">Auditoría para Estandarización del Catálogo Maestro</h2>
          <p className="subtitle">
            Diagnóstico directivo completo: Creaciones locales, colisiones de código, servicios duplicados y faltantes por zona.
          </p>
        </div>
      </div>

      {/* Apple-style Sub Navigation Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.75rem' }}>
        <button
          className={`tab-btn ${activeSubTab === 'LOCAL_CREATED' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('LOCAL_CREATED')}
        >
          Creaciones Locales ({localJobs.length})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'DUPLICATES' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('DUPLICATES')}
        >
          Servicios Repetidos Internos ({totalInternalDuplicates})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'CRITICAL_COLLISIONS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('CRITICAL_COLLISIONS')}
        >
          Colisiones Críticas ({criticalCollisions.length})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'MISSING_ALL' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MISSING_ALL')}
        >
          Faltantes por Zona ({stats.missing_at_least_1 || 345})
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'TYPOS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('TYPOS')}
        >
          Variantes Ortográficas ({minorTypos.length})
        </button>
      </div>

      {/* SUB-TAB 1: LOCAL CREATED JOBS */}
      {activeSubTab === 'LOCAL_CREATED' && (
        <div key="LOCAL_CREATED" className="apple-tab-content">
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--status-purple-border)',
            borderLeft: '3px solid var(--status-purple)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Catálogo Completo de Creaciones Locales ({localJobs.length} Trabajos)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Trabajos autogestionados por usuarios en sucursales específicas que no existen en las demás agencias.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="module-switcher" role="tablist">
                <button
                  className={`module-btn ${localViewMode === 'GRID' ? 'active' : ''}`}
                  onClick={() => setLocalViewMode('GRID')}
                >
                  Vista Cuadrícula
                </button>
                <button
                  className={`module-btn ${localViewMode === 'TABLE' ? 'active' : ''}`}
                  onClick={() => setLocalViewMode('TABLE')}
                >
                  Tabla Unificada
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
                    <th style={{ textAlign: 'center', width: '140px' }}>Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  {localJobs.map((item, idx) => {
                    const creatorBranchKey = branches.find(b => item.presence[b]);
                    const creatorBranchName = branchDisplayNames[creatorBranchKey] || creatorBranchKey;
                    const deptosUsed = Object.values(item.deptos).filter(Boolean);

                    return (
                      <tr key={idx}>
                        <td className="code-cell" style={{ color: 'var(--status-purple)' }}>{item.code}</td>
                        <td style={{ fontWeight: '600' }}>{item.main_desc}</td>
                        <td>
                          <span className="badge badge-purple">
                            {creatorBranchName}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
              {branches.map(b => {
                const list = localJobsByBranch[b] || [];
                const isExpanded = expandedBranches[b];
                const displayList = isExpanded ? list : list.slice(0, 7);

                return (
                  <div
                    key={b}
                    style={{
                      background: 'var(--bg-card)',
                      border: list.length > 0 ? '1px solid var(--status-purple-border)' : '1px solid var(--border-subtle)',
                      borderTop: list.length > 0 ? '3px solid var(--status-purple)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '340px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {branchDisplayNames[b]}
                        </span>
                        <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                          {list.length} Trabajos Propios
                        </span>
                      </div>

                      {list.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
                          Sin creaciones locales registradas.
                        </p>
                      ) : (
                        <div style={{ maxHeight: isExpanded ? '480px' : 'none', overflowY: isExpanded ? 'auto' : 'visible', paddingRight: isExpanded ? '0.3rem' : 0 }}>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                            {displayList.map((item, idx) => (
                              <li
                                key={idx}
                                style={{
                                  padding: '0.5rem 0',
                                  borderBottom: idx < displayList.length - 1 ? '1px dashed var(--border-glass)' : 'none',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: '0.75rem',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <span className="code-cell" style={{ fontSize: '0.78rem', minWidth: '45px', color: 'var(--status-purple)' }}>
                                  {item.code}
                                </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500', flex: 1, textAlign: 'right' }}>
                                  {item.main_desc}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {list.length > 7 && (
                      <button
                        className="btn-outline"
                        onClick={() => toggleBranchExpand(b)}
                        style={{
                          width: '100%',
                          marginTop: '1rem',
                          padding: '0.5rem',
                          fontSize: '0.8rem',
                          borderColor: 'var(--status-purple)',
                          color: 'var(--status-purple)',
                          fontWeight: '700'
                        }}
                      >
                        {isExpanded
                          ? `Contraer lista (ver solo 7 de ${list.length})`
                          : `Desglosar todos los ${list.length} trabajos de ${branchDisplayNames[b]}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: INTERNAL DUPLICATE SERVICES IN SAME BRANCH */}
      {activeSubTab === 'DUPLICATES' && (
        <div className="apple-tab-content">
          <div style={{
            background: 'var(--status-info-bg)',
            border: '1px solid var(--status-info-border)',
            borderLeft: '3px solid var(--status-info)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <h3 style={{ color: 'var(--status-info)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Servicios Repetidos Internamente ({totalInternalDuplicates} Servicios Redundantes)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Casos donde los usuarios crearon múltiples códigos de trabajo para la misma descripción exacta dentro del catálogo de una misma sucursal.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Filtrar Agencia:</span>
              <select
                className="select-filter"
                value={duplicateBranchFilter}
                onChange={(e) => setDuplicateBranchFilter(e.target.value)}
                style={{ padding: '0.45rem 2.5rem 0.45rem 1rem', fontSize: '0.82rem' }}
              >
                <option value="ALL">Todas las Agencias ({totalInternalDuplicates})</option>
                {branches.map(b => (
                  <option key={b} value={b}>
                    {branchDisplayNames[b]} ({(internalDuplicates[b] || []).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sucursal</th>
                  <th>Descripción del Servicio Duplicado</th>
                  <th>Códigos Asignados Internamente</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Total Códigos</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Acción CRM</th>
                </tr>
              </thead>
              <tbody>
                {branches
                  .filter(b => duplicateBranchFilter === 'ALL' || duplicateBranchFilter === b)
                  .flatMap(b => {
                    const list = internalDuplicates[b] || [];
                    return list.map((item, idx) => (
                      <tr key={`${b}-${idx}`}>
                        <td>
                          <span className="badge badge-nissan">{branchDisplayNames[b]}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{item.description}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {item.codes.map(c => (
                              <span key={c} className="code-cell" style={{ background: 'var(--bg-subtle)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-warning">{item.count} Códigos</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-purple">Fusionar a 1 Código</span>
                        </td>
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CRITICAL COLLISIONS */}
      {activeSubTab === 'CRITICAL_COLLISIONS' && (
        <div className="apple-tab-content">
          <div style={{
            background: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            borderLeft: '3px solid var(--status-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ color: 'var(--status-danger)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.35rem' }}>
              Se detectaron {criticalCollisions.length} colisiones de código críticas
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              En estos casos, <strong>el mismo número de código se utilizó para SERVICIOS COMPLETAMENTE DIFERENTES</strong> entre agencias (ej. <code style={{ background: 'var(--bg-subtle)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem' }}>A53</code> = Cambio de Aceite en 5 agencias vs. Reparar Tolva en Orizaba).
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>No. Tra</th>
                  <th>Estándar Sugerido (Mayoría 5 Agencias)</th>
                  <th>Discrepancia / Sucursal Conflictiva</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Acción CRM</th>
                </tr>
              </thead>
              <tbody>
                {criticalCollisions.map((item, idx) => (
                  <tr key={idx}>
                    <td className="code-cell" style={{ color: 'var(--nissan-red)', fontWeight: 'bold' }}>
                      {item.code}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--status-success)' }}>{item.proposed_standard}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {Object.entries(item.descriptions)
                          .filter(([_, d]) => d && d !== item.proposed_standard)
                          .map(([b, d]) => (
                            <div key={b} style={{ fontSize: '0.82rem' }}>
                              <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>
                                {branchDisplayNames[b]}
                              </span>
                              <span style={{ color: 'var(--status-danger)', fontWeight: '600' }}>{d}</span>
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

      {/* SUB-TAB 4: MISSING JOBS BREAKDOWN */}
      {activeSubTab === 'MISSING_ALL' && (
        <div className="apple-tab-content">
          <div style={{
            background: 'var(--status-warning-bg)',
            border: '1px solid var(--status-warning-border)',
            borderLeft: '3px solid var(--status-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <h3 style={{ color: 'var(--status-warning)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Desglose Completo de Trabajos Faltantes por Sucursal
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Hay un total de <strong>{stats.missing_at_least_1 || 345} trabajos</strong> que no existen en la totalidad de las 6 agencias (faltan en al menos 1 sucursal).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Filtrar nivel:</span>
              <select
                className="select-filter"
                value={missingFilter}
                onChange={(e) => setMissingFilter(e.target.value)}
                style={{ padding: '0.45rem 2.5rem 0.45rem 1rem', fontSize: '0.82rem' }}
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
                  <th>Presente En</th>
                  <th>Falta En</th>
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
                          <span key={b} className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                            {branchDisplayNames[b]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {item.missing_branches.map(b => (
                          <span key={b} className="badge badge-danger" style={{ fontSize: '0.68rem' }}>
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

      {/* SUB-TAB 5: MINOR TYPOS */}
      {activeSubTab === 'TYPOS' && (
        <div className="apple-tab-content">
          <div style={{
            background: 'var(--status-warning-bg)',
            border: '1px solid var(--status-warning-border)',
            borderLeft: '3px solid var(--status-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ color: 'var(--status-warning)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.35rem' }}>
              {minorTypos.length} Variantes Ortográficas o Sintácticas
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              El trabajo corresponde al mismo servicio, pero existen ligeras variaciones de redacción entre agencias (ej. <code style={{ background: 'var(--bg-subtle)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem' }}>VUELVA</code> vs <code style={{ background: 'var(--bg-subtle)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8rem' }}>VUELVE</code>).
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>No. Tra</th>
                  <th>Nombre Estándar Propuesto</th>
                  <th>Variantes por Agencia</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Acción CRM</th>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.82rem' }}>
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
