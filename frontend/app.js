// Kategorilere göre meyveleri gruplandırmak için bir sınıf oluştur
class FruitCategory {
    constructor(name, fruits) {
        this.name = name; // Kategori adı
        this.fruits = fruits; // Bu kategoriye ait meyveler
    }
}

// Tüm meyveler
const allFruits = [
    "Çilek", "Pamuk", "Kayısı", "Havuç", "Soğan Taze", "Çayır Otu Yeşilot",
    "Fasulye,Kuru", "Fındık", "Armut", "Ispanak","Şeker Pancarı"
];

// Meyve panelini oluştur
const fruitPanel = document.getElementById('fruit-panel');

allFruits.forEach(fruit => {
    const fruitItem = document.createElement('div');
    fruitItem.classList.add('fruit-item');
    fruitItem.textContent = fruit;
    fruitItem.addEventListener('click', () => {
        // Tıklanan meyvenin haritada görünmesini sağlar
        showFruitOnMap(fruit);
    });
    fruitPanel.appendChild(fruitItem);
});

// Harita oluşturuluyor ve başlangıç görünümü ayarlanıyor.
const map = L.map('map').setView([38.9637, 35.2433], 6); // Türkiye'nin koordinatları ve uygun bir zoom seviyesi

// Haritaya OpenStreetMap katmanı ekleniyor.
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Meyve ikonlarını ve bağlantılarını tutmak için bir nesne
const fruitLayers = {};

// Veri çekmek için async fonksiyon
(async () => {
    try {
        // JSON veriyi çekmek için fetch metodu
        const response = await fetch('http://localhost:3000/data'); // Veri URL'sini burada belirtin

        // JSON veriyi al
        const data = await response.json();

        // Her meyve veya ürün grubu için renk ataması
        const productColors = {
            "Çilek": "red",
            "Pamuk": "blue",
            "Kayısı": "brown",
            "Çayır Otu Yeşilot": "red",
            "Fasulye,Kuru": "purple",
            "Fındık": "brown",
            "Havuç": "orange",
            "Ispanak": "darkgreen",
            "Armut": "black",
            "Soğan Taze": "yellow",
            "Şeker Pancarı":"black"
        };

        // JSON veriyi işle
        data.forEach((item) => {
            // Gruba bağlı renk belirleme
            const productColor = productColors[item.fruit] || 'black';

            // Şehirlerin koordinatlarını birleştirerek bir çizgi oluştur.
            const lines = item.cities.map((city) => city.location);
            const polyline = L.polyline(lines, { color: productColor }).addTo(map);

            // İkon oluşturma
            const productIcon = L.icon({
                iconUrl: `images/${item.icon}`,
                iconSize: [24, 24],
                iconAnchor: [24, 48],
                popupAnchor: [0, -48]
            });

            // Şehirleri işle
            item.cities.forEach((city) => {
                // İşaretçi oluştur ve haritaya ekle
                const marker = L.marker(city.location, { icon: productIcon }).addTo(map);

                // İşaretçiye açılır pencere bağla
                const popupContent = `<strong>Şehir: ${city.name}</strong><br>` +
                    `Meyve: ${item.fruit}<br>` +
                    `Alan: ${city.area} km²<br>` +
                    `Üretim: ${city.manufacture} ton`;
                marker.bindPopup(popupContent);

                // İşaretçi üzerine gelindiğinde açılır pencereyi otomatik olarak açma
                marker.on('mouseover', function () {
                    marker.openPopup();
                });
            });

            // Meyve katmanını kaydet
            fruitLayers[item.fruit] = {
                polyline: polyline,
                markers: item.cities.map(city => city.location)
            };
        });

    } catch (error) {
        console.error('Veri yüklemesi sırasında hata:', error);
    }
})();

// Tıklanan meyveyi haritada görünür yapma fonksiyonu
function showFruitOnMap(fruit) {
    // Tüm meyve katmanlarını şeffaf yap
    Object.values(fruitLayers).forEach(layer => {
        layer.polyline.setStyle({ opacity: 0.3 });
    });

    // Tıklanan meyvenin katmanını görünür yap
    fruitLayers[fruit].polyline.setStyle({ opacity: 1 });
}
