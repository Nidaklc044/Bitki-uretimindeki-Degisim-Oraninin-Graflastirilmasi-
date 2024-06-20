// JavaScript kodları

class FruitCategory {
    constructor(name, fruits, className) {
      this.name = name;
      this.fruits = fruits;
      this.className = className;
    }
  }
  
  const categories = [
    new FruitCategory("Meyveler", ["Çilek", "Kayısı", "Armut"], "meyve"),
    new FruitCategory(
      "Sebzeler",
      ["Havuç", "Ispanak", "Soğan Taze", "Şeker Pancarı"],
      "sebze"
    ),
    new FruitCategory("Baklagiller", ["Fasulye,Kuru"], "baklagil"),
    new FruitCategory("Kuruyemişler", ["Fındık"], "kuruyemiş"),
    new FruitCategory("Diğer", ["Pamuk", "Çayır Otu Yeşilot"], "diger")
  ];
  
  const fruitPanel = document.getElementById("fruit-panel");
  const fruitList = document.querySelector(".fruit-list");
  
  categories.forEach((category) => {
    const categoryTitle = document.createElement("div");
    categoryTitle.classList.add("category-title");
    categoryTitle.textContent = category.name;
    fruitList.appendChild(categoryTitle);
  
    category.fruits.forEach((fruit) => {
      const fruitItem = document.createElement("div");
      fruitItem.classList.add("fruit-item");
      fruitItem.classList.add(category.className);
      fruitItem.textContent = fruit;
      fruitItem.addEventListener("click", () => {
        showFruitOnMap(fruit);
      });
      fruitList.appendChild(fruitItem);
    });
  });
  
  const map = L.map("map").setView([38.9637, 35.2433], 6);
  
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  let allFruitData = [];
  const fruitLayers = {};
  
  async function loadDataForYear(year) {
    try {
      const response = await fetch("http://localhost:3000/data");
      const data = await response.json();
      allFruitData = data.filter((item) => item.year === year);
  
      Object.values(fruitLayers).forEach((layer) => {
        map.removeLayer(layer.polyline);
        layer.markers.forEach((marker) => map.removeLayer(marker));
      });
  
      allFruitData.forEach((item) => {
        const productColor = getProductColor(item.fruit);
  
        const lines = item.cities.map((city) => city.location);
        const polyline = L.polyline(lines, { color: productColor }).addTo(map);
  
        const productIcon = L.icon({
          iconUrl: `images/${item.icon}`,
          iconSize: [24, 24],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48]
        });
  
        const markers = item.cities.map((city) => {
          const marker = L.marker(city.location, {
            icon: productIcon
          }).addTo(map);
          const popupContent = `<strong>Şehir: ${city.name}</strong><br>
                              Meyve: ${item.fruit}<br>
                              Alan: ${city.area} m²<br>
                              Üretim: ${city.manufacture} ton`;
          marker.bindPopup(popupContent);
  
          marker.on("mouseover", function () {
            marker.openPopup();
          });
  
          return marker;
        });
  
        fruitLayers[item.fruit] = {
          polyline: polyline,
          markers: markers
        };
      });
    } catch (error) {
      console.error("Veri yüklemesi sırasında hata:", error);
    }
  }
  
  function getProductColor(fruit) {
    const productColors = {
      Çilek: "red",
      Pamuk: "blue",
      Havuç: "orange",
      Fındık: "brown",
      "Çayır Otu Yeşilot": "green",
      Kayısı: "yellow",
      Armut: "green",
      Ispanak: "green",
      "Soğan Taze": "purple",
      "Şeker Pancarı": "pink",
      "Fasulye,Kuru": "gray"
    };
  
    return productColors[fruit] || "black";
  }
  
  function showFruitOnMap(fruit) {
    Object.keys(fruitLayers).forEach((fruitName) => {
      const layer = fruitLayers[fruitName];
      const opacity = fruitName === fruit ? 1 : 0;
      layer.polyline.setStyle({ opacity });
  
      layer.markers.forEach((marker) => {
        if (opacity === 1) {
          map.addLayer(marker); // Mevcut meyvenin markerlarını ekle
        } else {
          map.removeLayer(marker); // Diğer meyvelerin markerlarını kaldır
        }
      });
    });
  }
  
  document.getElementById("button2020").addEventListener("click", () => {
    loadDataForYear(2020);
  });
  
  document.getElementById("button2023").addEventListener("click", () => {
    loadDataForYear(2023);
  });
  
  document.getElementById("compareButton").addEventListener("click", () => {
    compareFruitData();
  });
  
  // generateComparisonPopupContent fonksiyonunu güncelleyelim
  function generateComparisonPopupContent(year2020Data, year2023Data, cityName) {
    let popupContent = "";
    if (year2020Data[cityName] && year2023Data[cityName]) {
      const areaDiff = year2023Data[cityName].area - year2020Data[cityName].area;
      const manufactureDiff = year2023Data[cityName].manufacture - year2020Data[cityName].manufacture;
      const areaDiffColor = areaDiff > 0 ? "green" : "red";
      const manufactureDiffColor = manufactureDiff > 0 ? "green" : "red";
      popupContent = `
              <strong>${cityName}:</strong><br>
              2020 - Alan: ${year2020Data[cityName].area}, Üretim: ${year2020Data[cityName].manufacture}<br>
              2023 - Alan: ${year2023Data[cityName].area}, Üretim: ${year2023Data[cityName].manufacture}<br>
              Fark - Alan: <span style="color: ${areaDiffColor}">${areaDiff}</span>, Üretim: <span style="color: ${manufactureDiffColor}">${manufactureDiff}</span><br>`;
    } else if (year2020Data[cityName]) {
      popupContent = `
              <strong>${cityName}:</strong><br>
              2020 - Alan: ${year2020Data[cityName].area}, Üretim: ${year2020Data[cityName].manufacture}<br>
              2023 - Veri yok<br>`;
    } else if (year2023Data[cityName]) {
      popupContent = `
              <strong>${cityName}:</strong><br>
              2020 - Veri yok<br>
              2023 - Alan: ${year2023Data[cityName].area}, Üretim: ${year2023Data[cityName].manufacture}<br>`;
    }
    return popupContent;
  }
  
  // compareFruitData fonksiyonunu güncelleyelim
  async function compareFruitData() {
    const response = await fetch("http://localhost:3000/data");
    const data = await response.json();
    const data2020 = data.filter((item) => item.year === 2020);
    const data2023 = data.filter((item) => item.year === 2023);
  
    const combinedData = {};
    [...data2020, ...data2023].forEach((item) => {
      if (!combinedData[item.fruit]) {
        combinedData[item.fruit] = { 2020: {}, 2023: {} };
      }
      const yearKey = item.year.toString();
      combinedData[item.fruit][yearKey] = item.cities.reduce((acc, city) => {
        acc[city.name] = {
          area: city.area,
          manufacture: city.manufacture,
        };
        return acc;
      }, {});
    });
  
    Object.keys(fruitLayers).forEach((fruitName) => {
      const year2020Data = combinedData[fruitName]["2020"];
      const year2023Data = combinedData[fruitName]["2023"];
  
      fruitLayers[fruitName].markers.forEach((marker) => {
        const cityName = marker.getPopup().getContent().split("<br>")[0].replace("<strong>Şehir: ", "").replace("</strong>", "");
        const popupContent = generateComparisonPopupContent(year2020Data, year2023Data, cityName);
  
        if (popupContent) {
          const completePopupContent = `
                  ${fruitName} Karşılaştırması<br>
                  ${popupContent}`;
          marker.bindPopup(completePopupContent);
        }
      });
    });
  }
  
  // Sayfa yüklendiğinde varsayılan olarak 2020 verilerini yükleyelim
  loadDataForYear(2020);
  function topologicalSort(graph) {
    let visited = new Set();
    let stack = [];
    let result = [];

    function dfs(node) {
      if (visited.has(node)) return;
      visited.add(node);
      if (graph[node]) {
        for (let neighbor of graph[node]) {
          dfs(neighbor);
        }
      }
      stack.push(node);
    }

    for (let node in graph) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    while (stack.length > 0) {
      result.push(stack.pop());
    }

    return result;
  }

  // Example Graph
  const graph = {
    "A": ["C"],
    "B": ["C", "D"],
    "C": ["E"],
    "D": ["F"],
    "E": ["H", "F"],
    "F": ["G"],
    "G": [],
    "H": []
  };

  const sortedTasks = topologicalSort(graph);
  console.log("Topological Sort:", sortedTasks)
