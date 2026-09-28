# OPPIA ROBOTICS — Web Sitesi

OPPIA ROBOTICS takımının tanıtım sitesi. Sunucu gerektirmeyen statik bir sitedir; Netlify üzerinde yayınlanır.

## Klasör yapısı

```
index.html          Sayfa iskeleti (menü, hero, hakkımızda, tarihçe, iletişim, footer)
js/site.js          İçerikleri JSON dosyalarından okuyup sayfaya yerleştirir; menü, galeri, form
content/            Düzenlenebilir içerikler
  team.json         Takım üyeleri ("featured": true olanlar üst satırda gösterilir)
  robots.json       Robotlar
  stats.json        "Rakamlarla OPPIA ROBOTICS" sayaçları
  awards.json       Ödüller ve dereceler
  gallery.json      "Arenadan Kareler" galerisi
images/             Logo, galeri, takım ve robot fotoğrafları
```

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
