# 📋 Diagnóstico y Contexto del Proyecto: Estandarización de Catálogos Nissan (Gasme Automotriz)

Este documento sintetiza la arquitectura, los antecedentes del proyecto, el trabajo ya completado para el catálogo de **Trabajos de Servicio**, y el análisis inicial para la nueva fase de **Paquetes de Servicio (Servicios)**.

---

## 🏛️ 1. Contexto de Negocio
**Gasme Automotriz** opera 6 agencias de la marca Nissan:
1. 📍 **Córdoba**
2. 📍 **Juchitán**
3. 📍 **Orizaba**
4. 📍 **Salina Cruz**
5. 📍 **Tierra Blanca**
6. 📍 **Tuxtepec**

### El Problema Operativo
Cada agencia ha operado de forma semi-autónoma en su sistema CRM/ERP, generando tres grandes fuentes de ineficiencia y riesgo financiero:
1. **Creaciones Locales:** Asesores y gerentes de servicio crean códigos propios sin autorización central.
2. **Colisiones de Códigos:** El mismo código de trabajo o paquete significa algo totalmente diferente entre agencias.
3. **Desalineación de Precios y Composición:** Para el mismo servicio de la marca Nissan (ej. Mantenimiento 10K o Cambio de Aceite), cada agencia incluye insumos distintos (o incompletos) y cobra precios radicalmente diferentes.

---

## 🛠️ 2. Lo Realizado: Módulo de Auditoría de Trabajos (`/catalogs_data.json`)

En la primera etapa del proyecto se procesaron los 6 catálogos Excel (`5 CATALOGOS TRABAJOS/*.XLSX`) de trabajos individuales.

### Metadatos y Cifras de Trabajos
- **Registros procesados:** 12,746 filas de catálogo.
- **Códigos únicos máster:** 2,223 códigos de trabajo (`arttrab`).
- **Estandarizados (100% Coincidencia):** 1,878 códigos (84.5%) presentes de manera uniforme en las 6 agencias.
- **Colisiones Críticas:** 131 códigos donde el código es idéntico pero la descripción o el departamento difieren drásticamente.
- **Variantes Ortográficas / Redacción:** 73 códigos con pequeñas diferencias de nombre o acentos.
- **Creaciones Locales Exclusivas:** 83 códigos creados en 1 sola agencia (principalmente en Orizaba y Córdoba).

### Componentes Construidos en React
- `SummaryCards.jsx`: Indicadores KPI ejecutivos (Total Máster, % Estandarizados, Colisiones Críticas, Variantes Ortográficas, Creaciones Locales).
- `DiscrepancyAudit.jsx`: Módulo interactivo para filtrar y revisar al instante colisiones críticas y creaciones locales por agencia.
- `CategoryComparisonTable.jsx`: Matriz de conteo por Departamento/Categoría (Servicio, Carrocería, Mecánica, etc.) para detectar sesgos como el de Orizaba.
- `CatalogMatrixTable.jsx`: Tabla máster navegable con buscador global y filtrado directo por agencias.

---

## 📦 3. Nueva Fase: Análisis del Catálogo de Paquetes de Servicio (Servicios)

Los **Paquetes de Servicio** (`Servicios/*.CSV`) son los "combos" preconfigurados que la marca Nissan define para las citas de mantenimiento preventivo y promociones por modelo/año de vehículo (ej. Mantenimiento 10K, 20K, 60K, Promo Aceite y Filtro `3PK`, etc.).

Cada paquete se compone de:
- **Código de Paquete (`numpaq`):** Identificador del combo (ej. `10K`, `3PK`, `LCA`).
- **Línea de Vehículo (`lineapaq` / `nomlinpaq`):** Modelo al que se aplica (ej. `92-NP300`, `83-TIIDA SEDAN`, `11-VERSA`).
- **Ítems del Combo (`arttrab` / `destra`):** Desglose interno entre **Mano de Obra** (ej. `PA1`, `10K`) y **Refacciones / Lubricantes** (ej. `TAMBOF423BDDL` aceite, `152089E01A` filtro).

### Hallazgos Diagnósticos de los 6 CSVs de Servicios (34,994 filas analizadas)

| Métrica Diagnóstica | Cifra / Resultado | Significado Operativo |
| :--- | :--- | :--- |
| **Total Filas Analizadas** | **34,994 registros** | Base completa de combos en las 6 agencias |
| **Códigos Únicos de Paquete (`numpaq`)** | **64 paquetes** | Oferta global de combos registrada |
| **Paquetes 100% Estandarizados** | **47 paquetes** | Presentes en el catálogo de las 6 agencias |
| **Paquetes Incompletos (Faltantes)** | **13 paquetes** | Presentes en solo 2 a 5 agencias |
| **Creaciones Locales (1 sola agencia)** | **4 paquetes** | `SM5` y `BN5` (Córdoba); `TX1` y `A76` (Juchitán) |
| **Combinaciones Paquete - Modelo** | **943 combinaciones** | Evaluadas en profundidad |
| **🚨 Discrepancia en Composición** | **165 combinaciones** | Mismo paquete y modelo, pero con **ítems e insumos distintos** |
| **💸 Variación Crítica de Precios** | **215 combinaciones** | Diferencia superior a $5 MXN (en casos más de $1,250 MXN) |

### Ejemplo Real de Inconsistencia Operativa Detectada:
Para el paquete **`3PK` (Promo Cambio de Aceite y Filtro)** en el modelo **NP 300 D23 (`C2`)**:
- 📍 **Orizaba, Salina Cruz, Tierra Blanca, Tuxtepec:** Cobran solo **$59.29 MXN** porque el paquete solo tiene cargado el ítem de Mano de Obra (`PA1`), **¡omitieron el aceite y el filtro!**
- 📍 **Córdoba:** Cobra **$540.87 MXN** (incluye filtro `152089E01A` y aceite tambo 20W `TAMBOF423BDDL`, pero omitió la mano de obra).
- 📍 **Juchitán:** Cobra **$1,313.00 MXN** (incluye mano de obra, filtro y aceite sintético embotellado `EMT103TA7CDL`).

---

## 🎯 4. Conclusión y Siguiente Paso
Dado que la problemática de los **Servicios** es aún más severa que la de los **Trabajos** (impacta directamente el precio al cliente y los insumos utilizados en taller), desarrollaremos un **módulo dedicado a Servicios** en la aplicación web React.
