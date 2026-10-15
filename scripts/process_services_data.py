import os
import csv
import json
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OCT_DIR = os.path.join(BASE_DIR, 'Servicios', 'paquetesdeserviciooctubre')
OUTPUT_JSON = os.path.join(BASE_DIR, 'public', 'services_data.json')

agencies = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC']

agency_files = {
    'CORDOBA': os.path.join(OCT_DIR, 'Paquetes_de_servicio.octubrecordobaCSV.CSV'),
    'JUCHITAN': os.path.join(OCT_DIR, 'Paquetes_de_serviciooctubrejuchitan.CSV'),
    'ORIZABA': os.path.join(OCT_DIR, 'Paquetes_de_serviciooctubreorizaba.CSV'),
    'SALINA_CRUZ': os.path.join(OCT_DIR, 'Paquetes_de_serviciooctubresalinacruz.CSV'),
    'TIERRA_BLANCA': os.path.join(OCT_DIR, 'Paquetes_de_serviciooctubretierrablanca.CSV'),
    'TUXTEPEC': os.path.join(OCT_DIR, 'Paquetes_de_serviciooctubretuxtepec.CSV')
}

all_numpaqs = set()
numpaq_details = defaultdict(lambda: {
    'code': '',
    'names': set(),
    'groups': set(),
    'presence': {ag: False for ag in agencies},
    'agency_row_counts': {ag: 0 for ag in agencies},
    'lines': set(),
    'line_details': defaultdict(lambda: defaultdict(list))
})

total_rows_processed = 0

for agency, fname in agency_files.items():
    if not os.path.exists(fname):
        raise FileNotFoundError(f"Archivo no encontrado para {agency}: {fname}")
        
    with open(fname, 'r', encoding='latin-1', errors='ignore') as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            total_rows_processed += 1
            np = r.get('numpaq', '').strip()
            if not np:
                continue
            
            all_numpaqs.add(np)
            nom = r.get('nompaq', '').strip()
            gpo_des = r.get('des_gpo', '').strip()
            line_code = r.get('lineapaq', '').strip()
            line_name = r.get('nomlinpaq', '').strip()
            art = r.get('arttrab', '').strip()
            destra = r.get('destra', '').strip()
            
            try: hrsreal = float(r.get('hrsreal', 0) or 0)
            except: hrsreal = 0.0
            try: hrspago = float(r.get('hrspago', 0) or 0)
            except: hrspago = 0.0
            try: hortra = float(r.get('hortra', 0) or 0)
            except: hortra = 0.0
            try: cantrefmat = float(r.get('cantrefmat', 0) or 0)
            except: cantrefmat = 0.0
            try: ventra = float(r.get('ventra', 0) or 0)
            except: ventra = 0.0
            try: totventra = float(r.get('totventra', 0) or 0)
            except: totventra = 0.0
            try: ctounit = float(r.get('ctounit', 0) or 0)
            except: ctounit = 0.0
            try: totcto = float(r.get('totcto', 0) or 0)
            except: totcto = 0.0
            try: utilbta = float(r.get('utilbta', 0) or 0)
            except: utilbta = 0.0
            try: margenuti = float(r.get('margenuti', 0) or 0)
            except: margenuti = 0.0
            
            p = numpaq_details[np]
            p['code'] = np
            if nom: p['names'].add(nom)
            if gpo_des: p['groups'].add(gpo_des)
            p['presence'][agency] = True
            p['agency_row_counts'][agency] += 1
            
            line_key = f"{line_code}||{line_name}"
            p['lines'].add(line_key)
            
            item_entry = {
                'arttrab': art,
                'destra': destra,
                'hrsreal': hrsreal,
                'hrspago': hrspago,
                'hortra': hortra,
                'cantrefmat': cantrefmat,
                'ventra': ventra,
                'totventra': totventra,
                'ctounit': ctounit,
                'totcto': totcto,
                'utilbta': utilbta,
                'margenuti': margenuti
            }
            p['line_details'][line_key][agency].append(item_entry)

def classify_agency_combo(items):
    if not items:
        return {'status': 'ABSENT', 'label': 'No Registrado', 'has_labor': False, 'has_parts': False, 'oil_type': 'NINGUNO'}
    
    # Check labor vs parts
    has_labor = any(it['hortra'] > 0 or it['arttrab'] in ['PA1', '10K', '20K', '30K', '40K', '50K', '60K'] or 'MANTENIMIENTO' in it['destra'] or 'PROMO' in it['destra'] or 'SERVICIO' in it['destra'] for it in items)
    has_parts = any(it['cantrefmat'] > 0 or 'ACEITE' in it['destra'] or 'FILTRO' in it['destra'] or 'TAMBO' in it['arttrab'] or it['arttrab'].startswith('15208') or it['arttrab'].startswith('EMT') for it in items)
    
    # Check oil type
    oil_type = 'NINGUNO'
    for it in items:
        art = it['arttrab'].upper()
        desc = it['destra'].upper()
        if 'EMT' in art or 'SINTETICO' in desc or 'SYNTHETIC' in desc:
            oil_type = 'SINTETICO'
            break
        elif 'TAMBO' in art or '20W' in desc or '10W' in desc or '5W' in desc:
            oil_type = 'MINERAL_TAMBO'
            break
        elif 'ACEITE' in desc:
            oil_type = 'ESTANDAR'
    
    if has_labor and has_parts:
        if oil_type == 'SINTETICO':
            return {'status': 'COMPLETE_SYNTHETIC', 'label': 'Completo (Aceite Sintético Embotellado)', 'has_labor': True, 'has_parts': True, 'oil_type': oil_type}
        else:
            return {'status': 'COMPLETE', 'label': 'Combo Completo (Mano de Obra + Refacciones)', 'has_labor': True, 'has_parts': True, 'oil_type': oil_type}
    elif has_labor and not has_parts:
        return {'status': 'LABOR_ONLY', 'label': 'Combo Incompleto: Solo Mano de Obra (Sin Aceite/Filtro)', 'has_labor': True, 'has_parts': False, 'oil_type': oil_type}
    elif has_parts and not has_labor:
        return {'status': 'PARTS_ONLY', 'label': 'Combo Incompleto: Solo Refacciones (Sin Mano de Obra)', 'has_labor': False, 'has_parts': True, 'oil_type': oil_type}
    else:
        return {'status': 'OTHER', 'label': 'Incompleto / Sin Clasificar', 'has_labor': has_labor, 'has_parts': has_parts, 'oil_type': oil_type}

package_matrix = []

fully_standardized_pkgs = 0
local_creations_pkgs = 0
missing_some_agency_pkgs = 0
composition_mismatch_combinations = 0
price_variation_combinations = 0
total_combinations_checked = 0

for np in sorted(list(all_numpaqs)):
    p = numpaq_details[np]
    presence = p['presence']
    agency_count = sum(1 for v in presence.values() if v)
    
    if agency_count == 6:
        fully_standardized_pkgs += 1
    elif agency_count == 1:
        local_creations_pkgs += 1
    else:
        missing_some_agency_pkgs += 1
        
    names_list = sorted(list(p['names']))
    primary_name = names_list[0] if names_list else np
    groups_list = sorted(list(p['groups']))
    
    lines_processed = []
    
    for line_key in sorted(list(p['lines'])):
        line_code, line_name = line_key.split('||')
        ag_items = p['line_details'][line_key]
        
        total_combinations_checked += 1
        
        ag_totals = {}
        ag_costs = {}
        ag_arts = {}
        ag_classifications = {}
        
        for ag in agencies:
            items = ag_items.get(ag, [])
            total_price = sum(it['totventra'] for it in items)
            total_cost = sum(it['totcto'] for it in items)
            art_set = sorted(list(set(it['arttrab'] for it in items if it['arttrab'])))
            
            ag_totals[ag] = round(total_price, 2)
            ag_costs[ag] = round(total_cost, 2)
            ag_arts[ag] = art_set
            ag_classifications[ag] = classify_agency_combo(items)
            
        present_agencies = [ag for ag in agencies if ag_items.get(ag)]
        art_sets_present = [frozenset(ag_arts[ag]) for ag in present_agencies]
        has_composition_mismatch = len(set(art_sets_present)) > 1
        if has_composition_mismatch and len(present_agencies) >= 2:
            composition_mismatch_combinations += 1
            
        prices_present = [ag_totals[ag] for ag in present_agencies]
        price_min = min(prices_present) if prices_present else 0
        price_max = max(prices_present) if prices_present else 0
        price_diff = round(price_max - price_min, 2)
        has_price_variation = (price_diff > 5.0) if prices_present else False
        if has_price_variation and len(present_agencies) >= 2:
            price_variation_combinations += 1
            
        cause_summary = []
        statuses = set(ag_classifications[ag]['status'] for ag in present_agencies)
        if 'LABOR_ONLY' in statuses:
            cause_summary.append("Agencias con Combo Incompleto (solo cobran mano de obra, faltan refacciones/aceite)")
        if 'PARTS_ONLY' in statuses:
            cause_summary.append("Agencias con Combo Incompleto (solo cobran refacciones, falta mano de obra)")
        if 'COMPLETE_SYNTHETIC' in statuses and 'COMPLETE' in statuses:
            cause_summary.append("Variación de insumos (Aceite Sintético Embotellado vs Tambo Mineral)")
        if has_price_variation:
            cause_summary.append(f"Diferencia de precio de hasta ${price_diff:,.2f} MXN entre agencias")
            
        lines_processed.append({
            'line_code': line_code,
            'line_name': line_name,
            'agencies_present': present_agencies,
            'prices': ag_totals,
            'costs': ag_costs,
            'price_min': price_min,
            'price_max': price_max,
            'price_diff': price_diff,
            'item_codes': ag_arts,
            'classifications': ag_classifications,
            'has_composition_mismatch': has_composition_mismatch,
            'has_price_variation': has_price_variation,
            'cause_summary': cause_summary,
            'items_by_agency': {
                ag: [
                    {
                        'art': it['arttrab'],
                        'desc': it['destra'],
                        'totventra': it['totventra'],
                        'totcto': it['totcto'],
                        'hortra': it['hortra'],
                        'cantrefmat': it['cantrefmat']
                    } for it in ag_items.get(ag, [])
                ] for ag in present_agencies
            }
        })
        
    package_matrix.append({
        'numpaq': np,
        'primary_name': primary_name,
        'all_names': names_list,
        'groups': groups_list,
        'presence': presence,
        'agency_count': agency_count,
        'line_count': len(lines_processed),
        'lines': lines_processed
    })

output_data = {
    'agencies': agencies,
    'total_rows_processed': total_rows_processed,
    'total_package_codes': len(all_numpaqs),
    'stats': {
        'fully_standardized_packages': fully_standardized_pkgs,
        'local_creations_packages': local_creations_pkgs,
        'partially_present_packages': missing_some_agency_pkgs,
        'total_combinations_checked': total_combinations_checked,
        'composition_mismatch_combinations': composition_mismatch_combinations,
        'price_variation_combinations': price_variation_combinations
    },
    'packages': package_matrix
}

print(f"Total Rows Processed: {total_rows_processed}")
print(f"Total Unique Packages: {len(all_numpaqs)}")
print(f"Stats: {json.dumps(output_data['stats'], indent=2)}")

with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

file_size_mb = os.path.getsize(OUTPUT_JSON) / (1024 * 1024)
print(f"Successfully written {OUTPUT_JSON} ({file_size_mb:.2f} MB)")
