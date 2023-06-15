# Buffalo Wild Wings Trivia Bot

Automatically answers Buffalo Wild Wings trivia questions using Puppeteer and Google search.

## Setup
1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository
3. Run `npm install` in the repository directory
4. Create a `cookies.json` file with your BWW account cookies. (I used Fiddler + the mobile app to grab mine, but you could probably use their actual site)
5. Run `node index.js`

The bot will automatically find questions and answer it to the best of its ability. 

<img src="https://i.imgur.com/uzuBVM5.png" height="400px">
<img src="https://i.imgur.com/yhMffLS.png" height="400px">

## How it works
- The bot uses puppeteer to open a headless Chrome instance and navigate to the BWW website, logging in with the cookies provided.
- It then navigates to the trivia page and waits for a question to appear.
- Once a question appears, it uses Google search to find the answer to the question.
- It sorts answers based on their count in the Google search results, and then clicks the answer with the highest count.
- It then waits for the next question to appear and repeats the process.

## How I made it
I used [Fiddler](https://www.telerik.com/fiddler) to find the requests the mobile app makes to allow me to play the game on Desktop (*I previously used ADB and OCR, but this is vastly more reliable*)

## `cookies.json` format
Obviously with more array entries with each cookie to set
```json
[
  {
    "name": "sessionid",
    "value": "aaaabbbbbccccddddeeee",
    "domain": ".buffalowildwings.com",
    "path": "/",
    "expires": -1,
    "size": 41,
    "httpOnly": false,
    "secure": false,
    "session": true,
    "sameSite": "Lax",
    "sameParty": false,
    "sourceScheme": "NonSecure",
    "sourcePort": 80
  }
]
```

