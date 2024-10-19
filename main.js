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

    // 更新用戶信息在網頁上
    document.getElementById('liff-status').innerText = 'LIFF init succeeded.';
    document.getElementById('user-id').innerText = `User ID: ${userId}`;
    document.getElementById('display-name').innerText = `Display Name: ${displayName}`;
    document.getElementById('profile-picture').src = pictureUrl;

    const apiKey = 'pathKg8vFtCZFQo59.a03c24ccd56fea312a07bfdd8ea5c958b4a5cc02e3e0d622345076ec54e522a3';
    const baseId = 'appmVhpvlM12J2ySD';
    const tableName = 'tblsBuEtURTFMZrJm'; 

    // 綁定確認按鈕的點擊事件
    document.getElementById('submitButton').addEventListener('click', () => {
      // 取得使用者輸入的身高、體重、興趣
      const height = parseFloat(document.getElementById('height').value);
      const weight = parseFloat(document.getElementById('weight').value);
      const hobbies = document.getElementById('hobbies').value;
      
      // 將輸入的數據顯示在網頁上
      document.getElementById('airtable-data').innerHTML = `
      <p>你輸入的資料如下：</p>
      <p>身高: ${height} cm</p>
      <p>體重: ${weight} kg</p>
      <p>興趣: ${hobbies}</p>
      `;

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
                height: height,
                weight: weight,
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
    document.getElementById('liff-status').innerText = 'LIFF init failed.';
    console.error('LIFF initialization failed:', error);
  });
