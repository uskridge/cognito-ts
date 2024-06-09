import { CognitoCommandSelector } from "./cognito";

const commands = CognitoCommandSelector();

commands
  .signIn()
  .then((session) => {
    console.log(session);
  })
  .catch((error) => {
    console.error(error);
  });
