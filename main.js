import './style.css';
import liff from '@line/liff';

liff
  .init({
    liffId: import.meta.env.VITE_LIFF_ID
  })
  .then(async () => {
    const profile = await liff.getProfile();
    const userId = profile.userId;
    const displayName = profile.displayName;
    const pictureUrl = profile.pictureUrl;

    // 將使用者資料顯示在網頁上
    document.querySelector('#app').innerHTML = `
      <h1>LIFF App</h1>
      <p>LIFF init succeeded.</p>
      <p>User ID: ${userId}</p>
      <p>Display Name: ${displayName}</p>
      <img src="${pictureUrl}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%;">
      <a href="https://developers.line.biz/ja/docs/liff/" target="_blank" rel="noreferrer">
        LIFF Documentation
      </a>
      <h2>Airtable Data:</h2>
      <div id="airtable-data"></div>
    `;

    const apiKey = 'pathKg8vFtCZFQo59.a03c24ccd56fea312a07bfdd8ea5c958b4a5cc02e3e0d622345076ec54e522a3';
    const baseId = 'appmVhpvlM12J2ySD';
    const tableName = 'tblsBuEtURTFMZrJm'; 

    // 先發送 GET 請求，檢查是否已經存在該 userId
    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={lineUserId}='${userId}'`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.records.length > 0) {
        // 如果找到 userId，則顯示訊息，不新增記錄
        console.log(`User ID ${userId} 已經存在於 Airtable 中。`);
        document.getElementById('airtable-data').innerHTML = `
          <p>User ID ${userId} 已經存在於 Airtable 中，不會新增記錄。</p>
        `;
      } else {
        // 如果沒找到 userId，則新增記錄
        console.log(`User ID ${userId} 不存在，新增記錄中...`);
        return fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              name: displayName,
              lineUserId: userId,
              information: "hello, world",
            }
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Airtable record created:', data);
          return fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });
        })
        .then(response => response.json())
        .then(data => {
          const records = data.records;
          let airtableHTML = '<table border="1"><tr><th>Record ID</th><th>Field Data</th></tr>';

          // 將每一筆記錄顯示在表格中
          records.forEach(record => {
            airtableHTML += `<tr><td>${record.id}</td><td>${JSON.stringify(record.fields)}</td></tr>`;
          });

          airtableHTML += '</table>';
          document.getElementById('airtable-data').innerHTML = airtableHTML;
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('airtable-data').innerHTML = `<p>Error: ${error}</p>`;
    });

  })
  .catch((error) => {
    document.querySelector('#app').innerHTML = `
      <h1>LIFF App</h1>
      <p>LIFF init failed.</p>
      <p><code>${error}</code></p>
      <a href="https://developers.line.biz/ja/docs/liff/" target="_blank" rel="noreferrer">
        LIFF Documentation
      </a>
    `;
  });
