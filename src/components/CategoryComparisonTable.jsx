import React from 'react';

export default function CategoryComparisonTable({ data }) {
  if (!data) return null;

  const branches = data.branches || [];
  const matrix = data.code_matrix || [];

  // Group matrix items by department and count presence per branch
  const deptoMap = {};

  matrix.forEach(item => {
    // Find predominant department for this code
    const deptosUsed = Object.values(item.deptos).filter(Boolean);
    const mainDepto = deptosUsed[0] || 'SIN DEPARTAMENTO';

    if (!deptoMap[mainDepto]) {
      deptoMap[mainDepto] = {
        name: mainDepto,
        counts: { CORDOBA: 0, JUCHITAN: 0, ORIZABA: 0, SALINA_CRUZ: 0, TIERRA_BLANCA: 0, TUXTEPEC: 0 },
        totalCodes: 0
      };
    }

    deptoMap[mainDepto].totalCodes += 1;

    branches.forEach(b => {
      if (item.presence[b]) {
        deptoMap[mainDepto].counts[b] = (deptoMap[mainDepto].counts[b] || 0) + 1;
      }
    });
  });

  const deptosList = Object.values(deptoMap);

  // Total sums per branch
  const branchTotals = {};
  branches.forEach(b => {
    branchTotals[b] = deptosList.reduce((sum, d) => sum + (d.counts[b] || 0), 0);
  });

  const branchDisplayNames = {
    CORDOBA: 'Córdoba',
    JUCHITAN: 'Juchitán',
    ORIZABA: 'Orizaba',
    SALINA_CRUZ: 'Salina Cruz',
    TIERRA_BLANCA: 'Tierra Blanca',
    TUXTEPEC: 'Tuxtepec'
  };

  return (
    <div className="section-card">
      <div className="section-title-bar">
        <div>
          <h2 className="section-title">📊 Resumen Comparativo de Conteo por Categoría y Zona</h2>
          <p className="subtitle">
            Conteo de trabajos disponibles en el catálogo de cada agencia desglosado por departamento/categoría.
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Departamento / Categoría</th>
              <th>Total Códigos</th>
              {branches.map(b => (
                <th key={b} style={{ textAlign: 'center' }}>
                  {branchDisplayNames[b] || b}
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>Estado / Alerta</th>
            </tr>
          </thead>
          <tbody>
            {deptosList.map((dept, idx) => {
              const counts = branches.map(b => dept.counts[b] || 0);
              const minCount = Math.min(...counts);
              const maxCount = Math.max(...counts);
              const hasVariation = maxCount - minCount > 10;

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {dept.name}
                  </td>
                  <td className="code-cell" style={{ textAlign: 'center' }}>
                    {dept.totalCodes}
                  </td>
                  {branches.map(b => {
                    const count = dept.counts[b] || 0;
                    const isMin = count === minCount && hasVariation;
                    const isMax = count === maxCount && hasVariation;

                    return (
                      <td
                        key={b}
                        style={{ textAlign: 'center' }}
                        className={isMin ? 'diff-highlight' : isMax ? 'diff-positive' : ''}
                      >
                        {count.toLocaleString()}
                        {isMin && <span style={{ fontSize: '0.7rem', display: 'block' }}>⬇ Menor</span>}
                        {isMax && <span style={{ fontSize: '0.7rem', display: 'block' }}>⬆ Mayor</span>}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    {hasVariation ? (
                      <span className="badge badge-danger">Desalineado</span>
                    ) : (
                      <span className="badge badge-success">Alineado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-header)', fontWeight: 'bold' }}>
              <td style={{ color: 'var(--accent-cyan)' }}>TOTAL GENERAL TRABAJOS</td>
              <td style={{ textAlign: 'center', color: 'var(--accent-cyan)' }}>
                {data.total_codes}
              </td>
              {branches.map(b => (
                <td key={b} style={{ textAlign: 'center', color: 'var(--accent-cyan)' }}>
                  {branchTotals[b]?.toLocaleString()}
                </td>
              ))}
              <td style={{ textAlign: 'center' }}>
                <span className="badge badge-warning">6 Agencias</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        💡 <strong>Observación clave:</strong> Nota la desalineación en <strong>Orizaba</strong> en el departamento <code>S - SERVICIO</code> (654 trabajos vs. ~985 en las demás agencias) y en <code>C - CARROCERIA</code> (1,243 trabajos vs. 1,101 en las demás agencias).
      </div>
    </div>
  );
}
