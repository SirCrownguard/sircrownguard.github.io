# Ertuğrul Sağlam

Tek sayfalık kişisel portfolyo ve iki sayfalık PDF özgeçmiş.

## Çalıştırma

Bu depo statik HTML, CSS ve JavaScript kullanır. Derleme veya sunucu tarafı uygulama gerektirmez.

```sh
python -m http.server 8080
```

Ardından tarayıcıda `http://localhost:8080` adresini açın. Dosyayı doğrudan açmak yerine HTTP sunucusu kullanın; ES modülleri HTTP üzerinden yüklenir.

## Dosyalar

- `index.html`: İçerik ve MD3E bileşenleri.
- `assets/css/site.css`: Responsive yerleşim ve görsel tasarım.
- `assets/js/app.js`: Gezinme, otomasyon ayrıntısı, döngüsel carousel ve X gönderileri.
- `assets/documents/Ertugrul-Saglam-CV.pdf`: Güncel, sabit sayfa düzenli A4 özgeçmiş.
- `assets/vendor/`: MD3E Web 1.0.14 ve yerel font dosyaları.

## GitHub Pages

Yayın kaynağı: `main` dalı, `/(root)` klasörü. Site, `SirCrownguard/sircrownguard.github.io` deposundan hesabın ana Pages adresinde yayımlanır.

Beklenen adres: https://sircrownguard.github.io/

X gönderileri X’in resmî gömme betiğiyle yüklenir. X yüklenemezse gönderiye giden önizleme bağlantısı görünür.

## Kaynaklar

Arayüz bileşenleri: [MD3E Web](https://materialwebunofficial.github.io/), Apache-2.0. Lisans `assets/vendor/MD3E-LICENSE.txt` içinde korunur. Proton logo ve ürün işaretleri Proton AG’ye, Technopat işaretleri Technopat’a aittir. Kişisel bilgiler, sertifikalar ve yazılar Ertuğrul Sağlam’a aittir.
