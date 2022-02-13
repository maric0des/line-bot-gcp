import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as line from '@line/bot-sdk';
require('dotenv').config();

// Initialize admin to access firestore
admin.initializeApp();

// For URL verification only (not necessary)
export const helloWorld = functions.https.onRequest(async (req, res) => {
  res.status(200).send();
});

export const sendLine = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const events = req.body.events;
  const client = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
      channelSecret: process.env.CHANNEL_SECRET as string
    });

  // Event data
  const userId = events[0].source.userId;
  const replyToken = events[0].replyToken;
  const timestamp = events[0].timestamp;

  // Message Object
  const msgObj = {
    "type": "flex",
    "altText": "Flex message",
    "contents": {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": ""
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [{}]
        }
      }
  };
  const buttonObj = {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "action",
          "uri": ""
        },
        "style": "primary",
        "color": "#0a95ff"
      };

  // Firestore query
  const users = db.collection("Users");
  const query = users.where("userId", "==", userId);

  await query.get()
    .then(async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Create new document when user does not exist
        await users.doc(timestamp.toString()).set({
            "userId": userId
        })
        
        msgObj.contents.body.contents[0].text = 'Account does not exist.';

        const result = await client.replyMessage(replyToken, msgObj as line.FlexMessage);
        res.status(200).send(result);
      } else {
        querySnapshot.forEach(async (doc) => {
          const firstName = doc.get("firstName");
          const lastName = doc.get("lastName");

          buttonObj.action.uri = 'https://google.com';
          msgObj.contents.body.contents[0].text = `Welcome back, ${lastName} ${firstName}`;
          msgObj.contents.footer.contents[0] = buttonObj;

          const result = await client.replyMessage(replyToken, msgObj as line.FlexMessage);
          res.status(200).send(result);
        });
      }
    })
    .catch((error) => {
      console.log("ErrorGettingDocuments: ", error);
    });
});
