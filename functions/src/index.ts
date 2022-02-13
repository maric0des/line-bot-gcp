import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as line from '@line/bot-sdk';
require('dotenv').config();

import { MessageOnly, MessageButton } from './Messages';

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

  // Firestore query
  const users = db.collection("Users");
  const query = users.where("userId", "==", userId);

  await query.get()
    .then(async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Create new document when user does not exist
        users.doc(timestamp.toString()).set({
            "userId": userId,
        })
          .then(async () => {
            MessageOnly.contents.body.contents[0].text = 'Account does not exist.';
    
            client.replyMessage(replyToken, MessageOnly as line.FlexMessage)
              .then((result) => res.status(200).send(result))
              .catch((err) => console.log("ErrorSendingMessage: " , err));
          })
          .catch((err) => console.log("ErrorSavingUserData: ", err))
        
      } else {
        querySnapshot.forEach(async (doc) => {
          // TODO: Register name of guest.
          // const firstName = doc.get("firstName");
          // const lastName = doc.get("lastName");

          MessageButton.contents.body.contents[0].text = `Welcome back, Guest!`;
          MessageButton.contents.footer.contents[0].action.label = 'Register';
          MessageButton.contents.footer.contents[0].action.uri = 'https://google.com';

          const result = await client.replyMessage(replyToken, MessageButton as line.FlexMessage);
          res.status(200).send(result);
        });
      }
    })
    .catch((error) => {
      console.log("ErrorGettingDocuments: ", error);
    });
});
