# OPPIA ROBOTICS — Web Sitesi

OPPIA ROBOTICS takımının tanıtım sitesi. Sunucu gerektirmeyen statik bir sitedir; Netlify üzerinde yayınlanır.

## Klasör yapısı

```
index.html          Sayfa iskeleti (menü, hero, hakkımızda, tarihçe, iletişim, footer)
js/site.js          İçerikleri JSON dosyalarından okuyup sayfaya yerleştirir; menü, galeri, form
content/            Düzenlenebilir içerikler
  site.json         Hero, Hakkımızda, Tarihçe ve İletişim metinleri, sosyal medya linkleri
  team.json         Takım üyeleri ("featured": true olanlar üst satırda gösterilir)
  robots.json       Robotlar
  stats.json        "Rakamlarla OPPIA ROBOTICS" sayaçları
  awards.json       Ödüller ve dereceler
  gallery.json      "Arenadan Kareler" galerisi
images/             Logo, galeri, takım ve robot fotoğrafları
  uploads/          Yönetim panelinden yüklenen fotoğraflar
admin/              Yönetim paneli (Decap CMS)
  config.yml        Panelde hangi alanların düzenlenebileceği
  preview.js/.css   Düzenleme ekranındaki canlı önizlemeler
```

## Yönetim paneli

İçerikler **https://www.oppiarobotics.com/admin** adresindeki panelden düzenlenir.
Giriş GitHub hesabıyla yapılır; bu repoya yazma yetkisi olan herkes kaydedebilir.
Panelde yapılan her kayıt `main` dalına bir commit olarak gider. Netlify kredisini
korumak için bu kayıtlar otomatik yayın başlatmaz (`[skip netlify]`). Değişiklikleri
siteye yansıtmak için Netlify'da **Deploys → Trigger deploy → Deploy project** ile
tek seferde yayınlayın. Panel ayarları `admin/config.yml` dosyasındadır.

## İçerik güncelleme

Takım üyesi, robot, ödül, sayaç veya galeri değişiklikleri için ilgili `content/*.json`
dosyasını düzenlemek yeterli; `index.html`'e dokunmak gerekmez. Yeni fotoğraflar
`images/` altındaki ilgili klasöre konur ve JSON'da yolu yazılır.

## Yerelde çalıştırma

İçerikler `fetch` ile yüklendiği için sayfa doğrudan dosyadan (`file://`) açıldığında
boş görünür. Bir yerel sunucu ile açın:

```
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresine gidin.
