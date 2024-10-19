import './style.css';
import liff from '@line/liff';

liff
  .init({
    liffId: import.meta.env.VITE_LIFF_ID
  })
  .then(async () => {
    // LIFF 初始化成功後取得使用者資料
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
    `;
  })
  .catch((error) => {
    // LIFF 初始化失敗，顯示錯誤訊息
    document.querySelector('#app').innerHTML = `
      <h1>LIFF App</h1>
      <p>LIFF init failed.</p>
      <p><code>${error}</code></p>
      <a href="https://developers.line.biz/ja/docs/liff/" target="_blank" rel="noreferrer">
        LIFF Documentation
      </a>
    `;
  });
