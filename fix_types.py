import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # useState fixes
    content = content.replace("useState([])", "useState<any[]>([])")
    content = content.replace("useState(null)", "useState<any>(null)")
    
    # Catch clauses
    content = re.sub(r'catch\s*\(\s*err\s*\)', 'catch (err: any)', content)
    
    # Single param arrow functions without types
    content = re.sub(r'\(\s*e\s*\)\s*=>', '(e: any) =>', content)
    content = re.sub(r'\(\s*p\s*\)\s*=>', '(p: any) =>', content)
    content = re.sub(r'\(\s*m\s*\)\s*=>', '(m: any) =>', content)
    content = re.sub(r'\(\s*a\s*\)\s*=>', '(a: any) =>', content)
    content = re.sub(r'\(\s*id\s*\)\s*=>', '(id: any) =>', content)
    content = re.sub(r'\(\s*product\s*\)\s*=>', '(product: any) =>', content)
    content = re.sub(r'\(\s*endDate\s*\)\s*=>', '(endDate: any) =>', content)
    
    # Multi param arrow functions
    content = re.sub(r'\(\s*productId\s*,\s*qty\s*\)\s*=>', '(productId: any, qty: any) =>', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

files = [
    'app/cashier/page.tsx',
    'app/login/page.tsx',
    'app/member/qr/[token]/page.tsx',
    'app/members/[id]/profile/page.tsx',
    'app/members/page.tsx',
    'app/page.tsx',
    'app/subscriptions/page.tsx'
]

for file in files:
    path = os.path.join(r"d:\gym-system\gym-system\gym-next", file)
    if os.path.exists(path):
        fix_file(path)
