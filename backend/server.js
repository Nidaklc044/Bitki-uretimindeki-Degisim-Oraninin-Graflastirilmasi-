// http modülü node.js'in http request'lerin yönetildiği modüldür.
const http = require('http');

// data.json dosyasını içeri aktarır.
const data = require('./data.json');

// CREATESERVER HTTP MODÜLÜNÜN BİR FONKSİYONUDUR VE REQUEST, RESPONSE OLMAK ÜZERE 2 PARAMETRE ALIR.
// request parametresi gelen isteğin bilgilerini barındırır.
// response parametresi ise gelen isteğe vereceğimiz cevabın bilgilerini barındırır.
http
  .createServer((request, response) => {

    // REQUEST - URL 
    // REQUEST - METHOD
    // REQUEST - DATA
    // REQUEST - HEADER

    // CORS GÜVENLİK ENGELİNİ AŞMAK İÇİN TÜM ADRESLERDEN VE TÜM İSTEK TİPLERİNDEN GELEN İSTEKLERİ KABUL ETTİK.
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      /** add other headers as per requirement */
    }

    // JSON FORMATINDA CEVAP DÖNECEĞİMİZİ BELİRTTİK.
    response.setHeader('Content-Type', 'application/json')

    // 200 BAŞARILI DURUM KODU
    response.writeHead(200, headers);

    // cevabı döner.
    response.write(JSON.stringify(data));

    // süreç tamamlanır
    response.end();
  })
  .listen(3000);
  // uygulamanın çalışacağı port
