export const MessageOnly = {
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
        }
      }
  };

export const MessageButton = {
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
        "contents": [{
          "type": "button",
          "action": {
            "type": "uri",
            "label": "",
            "uri": ""
          },
          "style": "primary",
          "color": "#0a95ff"
        }]
      }
    }
};