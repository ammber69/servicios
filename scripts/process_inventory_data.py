import csv
import json
import os
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, 'inventario', 'Inventario_de_unidades_por_ubicaciones_fisicasoctubre_.CSV')
OUT_PATH = os.path.join(BASE_DIR, 'public', 'inventory_data.json')

SERVICE_COST_BY_CATEGORY = {
    'SVC_1_5K':  650.00,   # 5,000 km – Cambio aceite y filtro
    'SVC_2_10K': 1100.00,  # 10,000 km – Servicio completo
    'SVC_3_15K': 1500.00,  # 15,000 km – Servicio mayor
    'SVC_4_20K': 2200.00,  # 20,000+ km
}

AGENCY_DISPLAY = {
    'CORDOBA':     'Córdoba',
    'TUXTEPEC':    'Tuxtepec',
    'ORIZABA':     'Orizaba',
    'JUCHITAN':    'Juchitán',
    'SALINA CRUZ': 'Salina Cruz',
    'TIERRA BLANCA': 'Tierra Blanca',
}

def is_seminuevo(row):
    tc = row.get('tipocompra', '').strip()
    nomsuc2 = row.get('nomsuc2', '').strip()
    moduni = row.get('moduni', '').strip()
    marca = row.get('marca', '').strip().upper()
    if tc in ('INT', 'USA', 'ODF'):
        return True
    if nomsuc2 == 'PEUELA' and moduni in ('2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'):
        return True
    if marca not in ('NISSAN', ''):
        return True
    return False

def classify_service(dias_str):
    try:
        dias = int(dias_str)
    except (ValueError, TypeError):
        return 'OK', 0, 0
    if dias >= 270:
        return 'SVC_3_15K', dias, SERVICE_COST_BY_CATEGORY['SVC_3_15K']
    elif dias >= 180:
        return 'SVC_2_10K', dias, SERVICE_COST_BY_CATEGORY['SVC_2_10K']
    elif dias >= 90:
        return 'SVC_1_5K', dias, SERVICE_COST_BY_CATEGORY['SVC_1_5K']
    else:
        return 'OK', dias, 0

def get_vehicle_family(caract):
    c = caract.upper()
    if 'FRONTIER' in c or 'NP300' in c:
        return 'Frontier / NP300'
    elif 'KICKS' in c:
        return 'Kicks'
    elif 'MAGNITE' in c:
        return 'Magnite'
    elif 'KAIT' in c:
        return 'Kait'
    elif 'XTRAIL' in c or 'X-TRAIL' in c:
        return 'X-Trail'
    elif 'SENTRA' in c:
        return 'Sentra'
    elif 'VERSA' in c:
        return 'Versa'
    elif 'MARCH' in c:
        return 'March'
    elif 'V-DRIVE' in c or 'VDRIVE' in c:
        return 'V-Drive'
    elif 'URVAN' in c:
        return 'Urvan'
    elif 'ALTIMA' in c:
        return 'Altima'
    elif 'PATHFINDER' in c:
        return 'Pathfinder'
    elif 'ARMADA' in c:
        return 'Armada'
    elif 'MURANO' in c:
        return 'Murano'
    elif 'NOTE' in c:
        return 'Note'
    elif 'CR-V' in c or 'CRV' in c:
        return 'Honda CR-V'
    elif 'TAOS' in c:
        return 'VW Taos'
    elif 'BAIC' in c or 'S25' in c:
        return 'BAIC'
    elif 'HYUNDAI' in c or 'HB20' in c:
        return 'Hyundai'
    else:
        return 'Otro'

SERVICE_LABELS = {
    'OK':        {'label': 'En Regla (<90 días)', 'color': 'green',  'icon': '✅'},
    'SVC_1_5K':  {'label': '1er Servicio (90-179 días / 5,000 km)', 'color': 'yellow', 'icon': '⚠️'},
    'SVC_2_10K': {'label': '2do Servicio (180-269 días / 10,000 km)', 'color': 'orange', 'icon': '🔴'},
    'SVC_3_15K': {'label': '3er Servicio (270+ días / 15,000 km)', 'color': 'red',    'icon': '🚨'},
}

def main():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"No se encontró el archivo: {CSV_PATH}")

    with open(CSV_PATH, encoding='latin-1', errors='ignore') as f:
        rows = list(csv.DictReader(f))

    print(f"Loaded {len(rows)} rows from {CSV_PATH}")

    vehicles_new = []
    vehicles_used = []

    for row in rows:
        agency_raw = row['nomsuc1'].strip()
        agency_display = AGENCY_DISPLAY.get(agency_raw, agency_raw)
        caract = row['caract'].strip()
        dias_str = row['diaseninv'].strip()
        ctototal_str = row['ctototal'].strip().replace(',', '')
        ctoori_str = row['ctoori'].strip().replace(',', '')

        try:
            ctototal = float(ctototal_str) if ctototal_str else 0.0
        except ValueError:
            ctototal = 0.0
        try:
            ctoori = float(ctoori_str) if ctoori_str else 0.0
        except ValueError:
            ctoori = 0.0

        vehicle = {
            'numinv':       row['numinv'].strip(),
            'caract':       caract,
            'marca':        row['marca'].strip(),
            'color':        row['color'].strip(),
            'moduni':       row['moduni'].strip(),
            'numser':       row['numser'].strip(),
            'agency_raw':   agency_raw,
            'agency':       agency_display,
            'ubicacion':    row['nomsuc2'].strip(),
            'dias':         int(dias_str) if dias_str.isdigit() else 0,
            'numfacc':      row['numfacc'].strip(),
            'fecreg':       row['fecreg'].strip(),
            'tipocompra':   row['tipocompra'].strip(),
            'obs':          row['obs_veh'].strip(),
            'tipuni':       row['tipuni'].strip(),
            'desnac_imp':   row['desnac_imp'].strip(),
            'ctototal':     ctototal,
            'ctoori':       ctoori,
            'family':       get_vehicle_family(caract),
            'aparado':      row['diasapar'].strip() == '1',
        }

        if is_seminuevo(row):
            vehicles_used.append(vehicle)
        else:
            svc_cat, dias, svc_cost = classify_service(dias_str)
            vehicle['svc_category'] = svc_cat
            vehicle['svc_label'] = SERVICE_LABELS[svc_cat]['label']
            vehicle['svc_icon'] = SERVICE_LABELS[svc_cat]['icon']
            vehicle['svc_cost_est'] = svc_cost
            vehicles_new.append(vehicle)

    AGENCIES = ['Córdoba', 'Orizaba', 'Tuxtepec', 'Juchitán', 'Salina Cruz', 'Tierra Blanca']

    def build_agency_stats(agency_display, new_list):
        ag_vehicles = [v for v in new_list if v['agency'] == agency_display]
        cats = defaultdict(list)
        for v in ag_vehicles:
            cats[v['svc_category']].append(v)

        total_svc_cost = sum(v['svc_cost_est'] for v in ag_vehicles)
        total_value = sum(v['ctototal'] for v in ag_vehicles)
        dias_list = [v['dias'] for v in ag_vehicles if v['dias'] > 0]

        return {
            'agency': agency_display,
            'total': len(ag_vehicles),
            'ok': len(cats['OK']),
            'svc1': len(cats['SVC_1_5K']),
            'svc2': len(cats['SVC_2_10K']),
            'svc3': len(cats['SVC_3_15K']),
            'pending_services': len(cats['SVC_1_5K']) + len(cats['SVC_2_10K']) + len(cats['SVC_3_15K']),
            'total_svc_cost': round(total_svc_cost, 2),
            'total_value': round(total_value, 2),
            'avg_days': round(sum(dias_list) / len(dias_list), 1) if dias_list else 0,
            'max_days': max(dias_list) if dias_list else 0,
            'vehicles': ag_vehicles,
        }

    agency_stats = [build_agency_stats(ag, vehicles_new) for ag in AGENCIES]

    total_new = len(vehicles_new)
    total_ok = sum(1 for v in vehicles_new if v['svc_category'] == 'OK')
    total_svc1 = sum(1 for v in vehicles_new if v['svc_category'] == 'SVC_1_5K')
    total_svc2 = sum(1 for v in vehicles_new if v['svc_category'] == 'SVC_2_10K')
    total_svc3 = sum(1 for v in vehicles_new if v['svc_category'] == 'SVC_3_15K')
    total_pending = total_svc1 + total_svc2 + total_svc3
    total_cost = sum(v['svc_cost_est'] for v in vehicles_new)
    total_fleet_value = sum(v['ctototal'] for v in vehicles_new)
    dias_all = [v['dias'] for v in vehicles_new if v['dias'] > 0]

    family_counts = defaultdict(int)
    for v in vehicles_new:
        family_counts[v['family']] += 1
    family_dist = sorted([{'family': k, 'count': v} for k, v in family_counts.items()], key=lambda x: -x['count'])

    over90 = sorted([v for v in vehicles_new if v['svc_category'] != 'OK'], key=lambda x: -x['dias'])

    used_by_agency = defaultdict(list)
    for v in vehicles_used:
        used_by_agency[v['agency']].append(v)

    used_agency_stats = []
    for ag in AGENCIES:
        ag_used = used_by_agency.get(ag, [])
        val = sum(v['ctototal'] for v in ag_used)
        dias_u = [v['dias'] for v in ag_used if v['dias'] > 0]
        used_agency_stats.append({
            'agency': ag,
            'total': len(ag_used),
            'total_value': round(val, 2),
            'avg_days': round(sum(dias_u)/len(dias_u), 1) if dias_u else 0,
            'max_days': max(dias_u) if dias_u else 0,
            'vehicles': ag_used,
        })

    output = {
        'generated_at': '2026-10-15',
        'agencies': AGENCIES,
        'service_labels': SERVICE_LABELS,
        'service_cost_estimates': SERVICE_COST_BY_CATEGORY,
        'summary': {
            'total_vehicles': len(rows),
            'total_new': total_new,
            'total_used': len(vehicles_used),
            'total_ok': total_ok,
            'total_svc1': total_svc1,
            'total_svc2': total_svc2,
            'total_svc3': total_svc3,
            'total_pending': total_pending,
            'pct_pending': round(100 * total_pending / total_new, 1) if total_new else 0,
            'total_svc_cost_est': round(total_cost, 2),
            'total_fleet_value': round(total_fleet_value, 2),
            'avg_days': round(sum(dias_all)/len(dias_all), 1) if dias_all else 0,
            'max_days': max(dias_all) if dias_all else 0,
        },
        'agency_stats': agency_stats,
        'used_agency_stats': used_agency_stats,
        'family_distribution': family_dist,
        'over90_vehicles': over90,
        'vehicles_new': vehicles_new,
        'vehicles_used': vehicles_used,
    }

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ Generated {OUT_PATH}: {len(rows)} vehicles ({total_new} new, {len(vehicles_used)} used)")
    print(f"   Pendientes servicio: {total_pending} ({output['summary']['pct_pending']}%)")
    print(f"   Valor flota nuevos: ${total_fleet_value:,.2f} MXN")

if __name__ == '__main__':
    main()
