import os
import csv
import json
from collections import defaultdict, Counter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OCT_DIR = os.path.join(BASE_DIR, '5 CATALOGOS TRABAJOS', 'catalagotrabajosoctubre')
OUTPUT_JSON = os.path.join(BASE_DIR, 'public', 'catalogs_data.json')

all_branches = ['CORDOBA', 'JUCHITAN', 'ORIZABA', 'SALINA_CRUZ', 'TIERRA_BLANCA', 'TUXTEPEC']

branch_files = {
    'CORDOBA': os.path.join(OCT_DIR, 'Catalogo_de_trabajosoctubrecordoba.CSV'),
    'JUCHITAN': os.path.join(OCT_DIR, 'Catalogo_de_trabajosoctubrejuchitan.CSV'),
    'ORIZABA': os.path.join(OCT_DIR, 'Catalogo_de_trabajosoctubreorizaba.CSV'),
    'SALINA_CRUZ': os.path.join(OCT_DIR, 'Catalogo_de_trabajosoctubresalinacruz.CSV'),
    'TIERRA_BLANCA': os.path.join(OCT_DIR, 'Catalogo_de_trabajos.octubretierrablancaCSV.CSV'),
    'TUXTEPEC': os.path.join(OCT_DIR, 'Catalogo_de_trabajosoctubretuxtepec.CSV')
}

def determine_depto(r):
    gpo_tra = r.get('gpo_tra', '').strip()
    gpovtaserv = r.get('gpovtaserv', '').strip()
    dgpovtaser = r.get('dgpovtaser', '').strip()
    des_gpo = r.get('des_gpo', '').strip()
    
    if gpo_tra == 'ME':
        return 'ME  - MANTENIMIENTO MENOR'
    elif gpo_tra == 'MA':
        return 'MA  - MANTENIMIENTO MAYOR'
    elif gpovtaserv == 'C' or dgpovtaser == 'CARROCERIA':
        return 'C  - CARROCERIA'
    elif gpovtaserv == 'S' or dgpovtaser == 'SERVICIO':
        return 'S  - SERVICIO'
    elif 'GENERIC' in dgpovtaser or 'GENERIC' in des_gpo:
        return '- (( TRABAJO GENERICO ))'
    return 'SIN DEPARTAMENTO'

branches_data = {}
internal_duplicates_by_branch = {}
total_rows_processed = 0

for b in all_branches:
    fpath = branch_files[b]
    if not os.path.exists(fpath):
        raise FileNotFoundError(f"Archivo no encontrado para {b}: {fpath}")
        
    jobs = {}
    desc_to_codes = defaultdict(list)
    with open(fpath, 'r', encoding='latin-1', errors='ignore') as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            total_rows_processed += 1
            code = r.get('numtra', '').strip()
            desc = r.get('destra', '').strip()
            tipo = r.get('dprevcorr', '').strip()
            depto = determine_depto(r)
            if not code:
                continue
            jobs[code] = {
                'code': code,
                'description': desc,
                'tipo': tipo,
                'depto': depto
            }
            if desc:
                desc_to_codes[desc].append(code)
                
    dups = []
    for d, codes in desc_to_codes.items():
        if len(codes) > 1:
            dups.append({
                'description': d,
                'codes': codes,
                'count': len(codes)
            })
    branches_data[b] = jobs
    internal_duplicates_by_branch[b] = dups

all_codes = set()
for b, jdict in branches_data.items():
    all_codes.update(jdict.keys())

code_matrix = []
critical_collision_count = 0
typo_count = 0

for code in sorted(all_codes):
    presence = {}
    descriptions = {}
    deptos = {}
    desc_list = []
    present_branches = []
    missing_branches = []
    
    for b in all_branches:
        if code in branches_data[b]:
            presence[b] = True
            d = branches_data[b][code]['description']
            descriptions[b] = d
            deptos[b] = branches_data[b][code]['depto']
            if d: desc_list.append(d)
            present_branches.append(b)
        else:
            presence[b] = False
            descriptions[b] = ''
            deptos[b] = ''
            missing_branches.append(b)
            
    presence_count = len(present_branches)
    missing_count = len(missing_branches)
    unique_descs = list(set(desc_list))
    has_naming_discrepancy = len(unique_descs) > 1
    
    proposed_standard = ''
    if desc_list:
        counts = Counter(desc_list)
        proposed_standard = counts.most_common(1)[0][0]
        
    severity = 'STANDARD'
    if presence_count == 1:
        severity = 'LOCAL'
    elif presence_count < 6 and not has_naming_discrepancy:
        severity = 'MISSING_SOME'
    elif has_naming_discrepancy:
        words_maj = set(proposed_standard.upper().split())
        is_critical = False
        for alt_d in unique_descs:
            if alt_d == proposed_standard: continue
            words_alt = set(alt_d.upper().split())
            overlap = words_maj.intersection(words_alt)
            if len(overlap) / max(len(words_maj), 1) < 0.2:
                is_critical = True
                break
        if is_critical:
            severity = 'CRITICAL_COLLISION'
            critical_collision_count += 1
        else:
            severity = 'TYPO'
            typo_count += 1
            
    code_matrix.append({
        'code': code,
        'presence': presence,
        'presence_count': presence_count,
        'missing_count': missing_count,
        'present_branches': present_branches,
        'missing_branches': missing_branches,
        'descriptions': descriptions,
        'has_naming_discrepancy': has_naming_discrepancy,
        'main_desc': proposed_standard,
        'proposed_standard': proposed_standard,
        'severity': severity,
        'deptos': deptos
    })

stats = {
    'critical_collisions': critical_collision_count,
    'minor_typos': typo_count,
    'local_creations': sum(1 for x in code_matrix if x['presence_count'] == 1),
    'fully_standardized': sum(1 for x in code_matrix if x['presence_count'] == 6),
    'missing_at_least_1': sum(1 for x in code_matrix if x['missing_count'] >= 1),
    'missing_1_branch': sum(1 for x in code_matrix if x['missing_count'] == 1),
    'missing_2_branches': sum(1 for x in code_matrix if x['missing_count'] == 2),
    'missing_3_branches': sum(1 for x in code_matrix if x['missing_count'] == 3),
    'missing_4_branches': sum(1 for x in code_matrix if x['missing_count'] == 4),
    'missing_5_branches': sum(1 for x in code_matrix if x['missing_count'] == 5),
    'total_internal_duplicates': sum(len(v) for v in internal_duplicates_by_branch.values())
}

output_data = {
    'branches': all_branches,
    'total_codes': len(code_matrix),
    'total_rows_processed': total_rows_processed,
    'stats': stats,
    'internal_duplicates': internal_duplicates_by_branch,
    'code_matrix': code_matrix
}

print(f"Total Rows Processed: {total_rows_processed}")
print(f"Total Codes: {len(code_matrix)}")
print(f"Stats: {json.dumps(stats, indent=2)}")

with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

file_size_mb = os.path.getsize(OUTPUT_JSON) / (1024 * 1024)
print(f"Successfully written {OUTPUT_JSON} ({file_size_mb:.2f} MB)")
