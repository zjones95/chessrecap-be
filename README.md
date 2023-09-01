# ChessRecap - Backend

This is the chessrecap backend repo, it's currently deployed via fly.io.

Technologies used:
* Node.js
* Express
* Chess.com Public API
* helmet
* luxon
* morgan

## Starting the app

First, clone the repo and run the command:

`npm install`

Then, populate the following secrets in a .env file in the root directory

```
PORT=<port number>
CHESS_COM_API_URL=<chess.com's public API url>
DATABASE_URL=<the postgres database url w/ credentials
```

Then, generate your tables with the command:

`npx prisma generate`

Now you can run the application with:

`npm run dev`

or deploy by running:

`npm run build && node dist/index.js`
