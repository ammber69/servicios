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

En la primera etapa se procesaron los 6 catálogos Excel originales, y posteriormente se actualizaron con los archivos oficiales CSV de Octubre (`5 CATALOGOS TRABAJOS/catalagotrabajosoctubre/`).

### Metadatos y Cifras de Trabajos (Actualizado a Octubre)
- **Registros procesados:** 12,647 filas de catálogo entre las 6 agencias.
- **Códigos únicos máster:** 2,223 códigos de trabajo (`arttrab` / `numtra`).
- **Estandarizados (100% Coincidencia):** 1,879 códigos (84.5%) presentes de manera uniforme en las 6 agencias (se sumó el código `MDM` en Orizaba).
- **Colisiones Críticas:** 131 códigos donde el código es idéntico pero la descripción o el departamento difieren drásticamente.
- **Variantes Ortográficas / Redacción:** 73 códigos con pequeñas diferencias de nombre o acentos.
- **Creaciones Locales Exclusivas:** 83 códigos creados en 1 sola agencia (principalmente en Orizaba y Córdoba).
- **Duplicados Internos en Agencia:** 250 casos donde una misma descripción tiene múltiples códigos asignados dentro de la misma sucursal.

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

### Hallazgos Diagnósticos de los 6 CSVs de Servicios (Actualizado a Octubre: 34,995 filas analizadas)

Archivos fuente en `Servicios/paquetesdeserviciooctubre/`:
1. `Paquetes_de_servicio.octubrecordobaCSV.CSV` → **Córdoba** (6,021 filas)
2. `Paquetes_de_serviciooctubrejuchitan.CSV` → **Juchitán** (5,723 filas)
3. `Paquetes_de_serviciooctubreorizaba.CSV` → **Orizaba** (6,082 filas)
4. `Paquetes_de_serviciooctubresalinacruz.CSV` → **Salina Cruz** (5,741 filas)
5. `Paquetes_de_serviciooctubretierrablanca.CSV` → **Tierra Blanca** (5,716 filas)
6. `Paquetes_de_serviciooctubretuxtepec.CSV` → **Tuxtepec** (5,712 filas)

| Métrica Diagnóstica | Cifra / Resultado | Significado Operativo |
| :--- | :--- | :--- |
| **Total Filas Analizadas** | **34,995 registros** | Base completa de combos en las 6 agencias |
| **Códigos Únicos de Paquete (`numpaq`)** | **64 paquetes** | Oferta global de combos registrada |
| **Paquetes 100% Estandarizados** | **47 paquetes** | Presentes en el catálogo de las 6 agencias |
| **Paquetes Incompletos (Faltantes)** | **13 paquetes** | Presentes en solo 2 a 5 agencias |
| **Creaciones Locales (1 sola agencia)** | **4 paquetes** | `A76` y `TX1` (Córdoba); `BN5` y `SM5` (Orizaba) |
| **Combinaciones Paquete - Modelo** | **944 combinaciones** | Evaluadas en profundidad |
| **🚨 Discrepancia en Composición** | **165 combinaciones** | Mismo paquete y modelo, pero con **ítems e insumos distintos** |
| **💸 Variación Crítica de Precios** | **216 combinaciones** | Diferencia superior a $5 MXN (en casos más de $1,260 MXN) |

### Ejemplo Real de Inconsistencia Operativa Detectada:
Para el paquete **`3PK` (Promo Cambio de Aceite y Filtro)** en el modelo **NP 300 D23 (`C2`)**:
- 📍 **Juchitán, Salina Cruz, Tierra Blanca, Tuxtepec:** Cobran solo **$59.29 MXN** porque el paquete solo tiene cargado el ítem de Mano de Obra (`PA1`), **¡omitieron el aceite y el filtro!**
- 📍 **Orizaba:** Cobra **$549.48 MXN** (incluye filtro `152089E01A` y aceite tambo 20W `TAMBOF423BDDL`).
- 📍 **Córdoba:** Cobra **$1,321.61 MXN** (incluye mano de obra, filtro y aceite sintético embotellado `EMT103TA7CDL`).

---

## 🎯 4. Conclusión y Siguiente Paso
El módulo dedicado a **Servicios** en la aplicación web React procesa estos datos de forma interactiva y permite auditar en tiempo real tanto la disponibilidad como los desgloses de mano de obra y refacciones.
