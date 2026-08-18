import React, { useState } from 'react';

export default function DiscrepancyAudit({ data }) {
  if (!data) return null;

  const branches = data.branches || [];
  const matrix = data.code_matrix || [];

  const [activeSubTab, setActiveSubTab] = useState('CRITICAL_COLLISIONS');

  const branchDisplayNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  // Filter items by severity
  const criticalCollisions = matrix.filter(item => item.severity === 'CRITICAL_COLLISION');
  const minorTypos = matrix.filter(item => item.severity === 'TYPO');
  const localJobs = matrix.filter(item => item.severity === 'LOCAL');
  const nearStandard = matrix.filter(item => item.severity === 'MISSING_SOME' && item.presence_count === 5);

  // Group local jobs by branch
  const localJobsByBranch = {};
  branches.forEach(b => {
    localJobsByBranch[b] = localJobs.filter(item => item.presence[b]);
  });

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">⚠️ Auditoría para la Estandarización del Catálogo Maestro</h2>
          <p className="subtitle">
            Diagnóstico detallado para resolver colisiones de código, errores de nomenclatura y creaciones locales.
          </p>
        </div>
      </div>

      {/* Sub-tabs for Audit */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <button
          className={`tab-btn ${activeSubTab === 'CRITICAL_COLLISIONS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('CRITICAL_COLLISIONS')}
          style={{ background: activeSubTab === 'CRITICAL_COLLISIONS' ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : '' }}
        >
          🚨 Colisiones Críticas
          <span className="tab-badge">{criticalCollisions.length}</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'TYPOS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('TYPOS')}
        >
          ✏️ Diferencias Ortográficas
          <span className="tab-badge">{minorTypos.length}</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'LOCAL_CREATED' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('LOCAL_CREATED')}
        >
          🟣 Creaciones Locales
          <span className="tab-badge">{localJobs.length}</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'NEAR_STANDARD' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('NEAR_STANDARD')}
        >
          🟡 Faltantes en 1 Agencia
          <span className="tab-badge">{nearStandard.length}</span>
        </button>
      </div>

      {/* Sub-tab 1: Critical Collisions */}
      {activeSubTab === 'CRITICAL_COLLISIONS' && (
        <div>
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ color: '#fb7185', fontSize: '1rem', fontWeight: '700', marginBottom: '0.3rem' }}>
              🚨 ¡Atención! Se detectaron {criticalCollisions.length} colisiones de código críticas
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              En estos casos, <strong>el mismo número de código se utilizó para SERVICIOS COMPLETAMENTE DIFERENTES</strong> entre agencias. Por ejemplo, mientras 5 agencias usan <code>A53</code> para <em>"Cambio de Aceite de Motor"</em>, Orizaba usó <code>A53</code> para <em>"Reparar Tolva de Escape"</em>.
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
                {criticalCollisions.map((item, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="code-cell" style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>
                        {item.code}
                      </td>
                      <td>
                        <strong style={{ color: '#34d399' }}>{item.proposed_standard}</strong>
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
                                <span style={{ color: '#fca5a5' }}>{d}</span>
                              </div>
                            ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-warning">Reasignar Código</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Minor Typos */}
      {activeSubTab === 'TYPOS' && (
        <div>
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: '700', marginBottom: '0.3rem' }}>
              ✏️ {minorTypos.length} Variantes Ortográficas o Sintácticas
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              El trabajo corresponde al mismo servicio, pero existen ligeras variaciones de redacción entre agencias (ej. <code>VUELVA</code> vs <code>VUELVE</code>, o abreviaturas como <code>C/</code> vs <code>CON</code>).
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
                      <strong style={{ color: 'var(--accent-cyan)' }}>{item.proposed_standard}</strong>
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

      {/* Sub-tab 3: Local Created Jobs */}
      {activeSubTab === 'LOCAL_CREATED' && (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Los siguientes <strong>{localJobs.length} trabajos</strong> fueron creados por los usuarios en sucursales específicas y no existen en los catálogos del resto del grupo:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {branches.map(b => {
              const list = localJobsByBranch[b] || [];
              return (
                <div
                  key={b}
                  style={{
                    backgroundColor: 'var(--bg-header)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      📍 {branchDisplayNames[b]}
                    </span>
                    <span className="badge badge-purple">{list.length} Trabajos Propios</span>
                  </div>

                  {list.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sin creaciones locales.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                      {list.slice(0, 10).map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            padding: '0.4rem 0',
                            borderBottom: idx < list.length - 1 ? '1px dashed var(--border-color)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <span className="code-cell" style={{ fontSize: '0.8rem' }}>{item.code}</span>
                          <span style={{ color: 'var(--text-secondary)', flex: 1, textAlign: 'right' }}>
                            {item.main_desc}
                          </span>
                        </li>
                      ))}
                      {list.length > 10 && (
                        <li style={{ textAlign: 'center', color: 'var(--accent-blue)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                          + {list.length - 10} trabajos más en esta agencia
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 4: Near Standard (Missing in 1 agency) */}
      {activeSubTab === 'NEAR_STANDARD' && (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Estos <strong>{nearStandard.length} trabajos</strong> existen en 5 agencias y solo faltan en 1 sucursal. Son los candidatos principales a dar de alta para estandarizar:
          </p>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>No. Tra</th>
                  <th>Descripción del Servicio</th>
                  <th>Agencia Faltante</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {nearStandard.map((item, idx) => {
                  const missingBranchKey = branches.find(b => !item.presence[b]);
                  const missingBranchName = branchDisplayNames[missingBranchKey] || missingBranchKey;

                  return (
                    <tr key={idx}>
                      <td className="code-cell">{item.code}</td>
                      <td style={{ fontWeight: '500' }}>{item.main_desc}</td>
                      <td>
                        <span className="badge badge-danger">Falta en {missingBranchName}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-warning">Presente en 5 / 6</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
