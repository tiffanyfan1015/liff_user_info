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

    document.getElementById('display-name').innerText = displayName;
    document.getElementById('profile-picture').src = pictureUrl;

    const apiKey = 'pathKg8vFtCZFQo59.a03c24ccd56fea312a07bfdd8ea5c958b4a5cc02e3e0d622345076ec54e522a3';
    const baseId = 'appmVhpvlM12J2ySD';
    const tableName = 'tblsBuEtURTFMZrJm'; 

    // check if data exist
    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula={lineUserId}='${userId}'`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
    .then(response => response.json())
    .then(data => {
      const records = data.records;
      if (records.length > 0) {
        const userData = records[0].fields.personalInformation;
        const parsedData = JSON.parse(userData);

        document.getElementById('user_name').value = parsedData.user_name || displayName;
        document.getElementById('height').value = parsedData.height || '';
        document.getElementById('weight').value = parsedData.weight || '';
        document.getElementById('intake').value = parsedData.intake || '中';
        document.getElementById('vegan').value = parsedData.vegan || '葷食';
        document.getElementById('goal').value = parsedData.goal || '';
        document.getElementById('others').value = parsedData.others || '';
      } else {
        document.getElementById('user_name').value = displayName;
      }
    })
    .catch(error => {
      console.error('Error fetching data from Airtable:', error);
    });

    document.getElementById('submitButton').addEventListener('click', () => {
      console.log('Button clicked!');

      // get user input
      const user_name = document.getElementById('user_name').value;
      const height = parseFloat(document.getElementById('height').value);
      const weight = parseFloat(document.getElementById('weight').value);
      const intake = document.getElementById('intake').value;
      const vegan = document.getElementById('vegan').value;
      const goal = document.getElementById('goal').value;
      const others = document.getElementById('others').value;

      console.log({ user_name, height, weight, intake, vegan, goal, others });

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

      fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performUpsert: {
            fieldsToMergeOn: ["lineUserId"]
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
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Airtable full response:', data); 
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
    console.error('LIFF initialization failed:', error);
  });
