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
    // document.getElementById('liff-status').innerText = 'LIFF init succeeded.';
    // document.getElementById('user-id').innerText = `User ID: ${userId}`;
    document.getElementById('display-name').innerText = `Hi! ${displayName}`;
    document.getElementById('profile-picture').src = pictureUrl;

    const apiKey = 'pathKg8vFtCZFQo59.a03c24ccd56fea312a07bfdd8ea5c958b4a5cc02e3e0d622345076ec54e522a3';
    const baseId = 'appmVhpvlM12J2ySD';
    const tableName = 'tblsBuEtURTFMZrJm'; 

    document.getElementById('user_name').value = displayName;

    // 綁定確認按鈕的點擊事件
    document.getElementById('submitButton').addEventListener('click', () => {
      // 取得使用者輸入的身高、體重、興趣
      const user_name = document.getElementById('user_name').value;
      const height = parseFloat(document.getElementById('height').value);
      const weight = parseFloat(document.getElementById('weight').value);
      const intake = document.getElementById('intake').value;
      const vegan = document.getElementById('vegan').value;
      const goal = document.getElementById('goal').value;
      const others = document.getElementById('others').value;

      const personalInformationObject = {
        user_name: user_name,
        height: height.toString(),
        weight: weight.toString(),
        intake: intake,
        vegan: vegan,
        goal: goal,
        others: others,
      };

      const personalInformationString = JSON.stringify(personalInformationObject);
      
      // 將輸入的數據顯示在網頁上
      document.getElementById('airtable-data').innerHTML = `
      <p>你輸入的資料如下：</p>
      <p>稱呼：${user_name}</p>
      <p>身高: ${height} cm</p>
      <p>體重: ${weight} kg</p>
      <p>食量: ${intake}</p>
      <p>葷素: ${vegan}</p>
      <p>目標: ${goal}</p>
      <p>其他: ${others}</p>
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
                personalInformation: personalInformationString,
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
          <p>資料已成功更新！</p>
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
