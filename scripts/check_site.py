"""Validate local static-site references and the published CV, without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import parse_qs,urlsplit,unquote
import re,hashlib
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=set();self.certificates=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for key in ['src','href']:
   if key in a:self.refs.append(a[key])
  if 'id' in a:
   assert a['id'] not in self.ids,'Duplicate ID: '+a['id'];self.ids.add(a['id'])
  if 'data-certificate' in a:self.certificates+=1
def check_url(url,base):
 if not url or url.startswith(('#','http:','https:','mailto:','tel:','data:')):return
 path=(base/unquote(urlsplit(url).path)).resolve()
 assert path.is_relative_to(ROOT),f'Local URL escapes site root: {url}'
 assert path.is_file(),f'Missing local asset: {url}'
page=(ROOT/'index.html').read_text(encoding='utf-8')
assert 'localhost' not in page and 'C:\\Users' not in page
assert 'Portfolyo taslağı' not in page
p=Links();p.feed(page)
for url in p.refs:check_url(url,ROOT)
documents=set()
for url in p.refs:
 viewer=urlsplit(url)
 if viewer.path.endswith('/pdfjs/web/viewer.html'):
  pdf_url,=parse_qs(viewer.query)['file']
  check_url(pdf_url,(ROOT/viewer.path).parent)
  documents.add(Path(urlsplit(pdf_url).path).name)
assert documents=={'Ertugrul-Saglam-CV.pdf','certificate-0.pdf','certificate-1.pdf','certificate-2.pdf'}
for css in (ROOT/'assets').rglob('*.css'):
 for url in re.findall(r'url\(\s*[\"\x27]?([^\)\"\x27\s]+)',css.read_text(encoding='utf-8')):check_url(url,css.parent)
assert p.certificates==3
assert {'baslangic','projeler','deneyim','yazilar','egitim','iletisim'}<=p.ids
pdf=ROOT/'assets/documents/Ertugrul-Saglam-CV.pdf'
assert pdf.read_bytes().startswith(b'%PDF-')
assert b'/Count 2' in pdf.read_bytes(),'Expected two-page CV'
print(f'PASS: {len(p.refs)} HTML references, CSS assets, 3 certificates and two-page CV.')
print('CV SHA-256:',hashlib.sha256(pdf.read_bytes()).hexdigest())
