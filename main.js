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

      <!-- 表單讓使用者輸入資料 -->
      <h2>填寫資料：</h2>
      <label for="height">身高 (cm):</label><br>
      <input type="text" id="height" name="height"><br><br>

      <label for="weight">體重 (kg):</label><br>
      <input type="text" id="weight" name="weight"><br><br>

      <label for="hobbies">興趣:</label><br>
      <input type="text" id="hobbies" name="hobbies"><br><br>

      <button id="submitButton">確認</button>
      <div id="airtable-data"></div>
    `;

    const apiKey = 'pathKg8vFtCZFQo59.a03c24ccd56fea312a07bfdd8ea5c958b4a5cc02e3e0d622345076ec54e522a3';
    const baseId = 'appmVhpvlM12J2ySD';
    const tableName = 'tblsBuEtURTFMZrJm'; 

    // 綁定確認按鈕的點擊事件
    document.getElementById('submitButton').addEventListener('click', () => {
      // 取得使用者輸入的身高、體重、興趣
      const height = document.getElementById('height').value;
      const weight = document.getElementById('weight').value;
      const hobbies = document.getElementById('hobbies').value;

      // 使用performUpsert來自動合併或新增記錄
      fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performUpsert: {
            fieldsToMergeOn: ["lineUserId"] // 指定用 lineUserId 作為唯一識別符號
          },
          records: [
            {
              fields: {
                lineUserId: userId,
                name: displayName,
                height: `${height} cm`,
                weight: `${weight} kg`,
                hobbies: hobbies,
              }
            }
          ]
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Airtable full response:', data);  // 顯示完整的 API 回應

        const records = data.records || [];
        let recordText = '';
        records.forEach(record => {
          recordText += `<p>Record ID: ${record.id}, Fields: ${JSON.stringify(record.fields)}</p>`;
        });

        document.getElementById('airtable-data').innerHTML = `
          <p>資料已成功更新至 Airtable。</p>
          <p>Created Records: ${data.createdRecords ? JSON.stringify(data.createdRecords) : 'N/A'}</p>
          <p>Updated Records: ${data.updatedRecords ? JSON.stringify(data.updatedRecords) : 'N/A'}</p>
          <h3>記錄詳情：</h3>
          ${recordText}
        `;
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('airtable-data').innerHTML = `<p>Error: ${error}</p>`;
      });
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
