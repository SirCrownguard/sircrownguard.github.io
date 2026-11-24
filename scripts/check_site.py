"""Validate local static-site references and the published CV, without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,hashlib
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=set();self.document_buttons={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for key in ['src','href']:
   if key in a:self.refs.append(a[key])
  if 'id' in a:
   assert a['id'] not in self.ids,'Duplicate ID: '+a['id'];self.ids.add(a['id'])
  if a.get('id')=='cv-view' or 'data-certificate' in a:
   key=a.get('data-certificate','cv-view')
   assert key not in self.document_buttons,f'Duplicate document button: {key}'
   self.document_buttons[key]=a
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
check_url('assets/vendor/pdfjs/web/viewer.html',ROOT)
documents={
 'cv-view':'Ertugrul-Saglam-CV.pdf',
 'certificate-0':'certificate-0.pdf',
 'certificate-1':'certificate-1.pdf',
 'certificate-2':'certificate-2.pdf',
}
assert p.document_buttons.keys()==documents.keys(),'Expected a CV button and three certificate buttons'
for key,filename in documents.items():
 button=p.document_buttons[key]
 link=urlsplit(button.get('href',''))
 assert not (link.scheme or link.netloc),f'Expected a local document link: {key}'
 assert Path(link.path)==Path('assets/documents')/filename,f'Expected a direct PDF link: {key}'
 assert button.get('target')=='_blank' and 'download' not in button,f'Expected the PDF to open in a new tab: {key}'
for css in (ROOT/'assets').rglob('*.css'):
 for url in re.findall(r'url\(\s*[\"\x27]?([^\)\"\x27\s]+)',css.read_text(encoding='utf-8')):check_url(url,css.parent)
assert {'baslangic','projeler','deneyim','yazilar','egitim','iletisim'}<=p.ids
pdf=ROOT/'assets/documents/Ertugrul-Saglam-CV.pdf'
assert pdf.read_bytes().startswith(b'%PDF-')
assert b'/Count 2' in pdf.read_bytes(),'Expected two-page CV'
print(f'PASS: {len(p.refs)} HTML references, CSS assets, 3 certificates and two-page CV.')
print('CV SHA-256:',hashlib.sha256(pdf.read_bytes()).hexdigest())
