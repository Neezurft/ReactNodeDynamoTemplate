ReactNodeDynamoTemplate

- A template to get an simple rest api and webapp running and ready to go!

API:

- get to the ./api folder and run:
  `npm install`

  create a config.json file with the following shape:

  {
  "service-name": "add-me",
  "stage-name": "add-me",
  "endpoint-prefix": "add-me"
  }

now the stack should be ready to be deployed (AWS credentials need to be set up in advance) by running `npm run deploy`.

- to test locally run:
  `npm run start-db`
  `npm run local-test`

WEBAPP:

- to be added
