const axios = require("axios")

const mondayService = require('../services/monday-service');
const apiKey = process.env.API_KEY

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;

    const { boardId, itemId, userColumn } = inputFields;

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, userColumn)
    if(!text) {
      return res.status(200).send({});
    }
    const obj = JSON.parse(text)
    const userId = obj.personsAndTeams[0].id

    axios({
      url: 'https://api.monday.com/v2',
      method: 'post',
      headers: {
          'Authorization': apiKey
      },
      data: {
          query: `
              query {
                  users (ids: ${userId}) {
                      email
                  }
              }
          `
      }
  }).then((result) => {
      const userEmail = result.data.data.users[0].email
      if (userEmail) {
          const updateEmailColumn  = axios({
              url: 'https://api.monday.com/v2',
              method: 'post',
              headers: {
                  'Authorization': apiKey
              },
              data: {
                  query: `
                      mutation {
                          change_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: "email", value: "{\\"email\\":\\"${userEmail}\\",\\"text\\":\\"${userEmail}\\"}") {
                              id
                          }
                      }
                  `
              }
          }).then((result) => {
              console.log(result.data)
          });
      }
  });
    return res.status(200).send({});
  } catch (err) {
      console.log(err);
      return res.status(500).send({ mesage: 'internal server error' });
  }
}

module.exports = {
  executeAction
};
