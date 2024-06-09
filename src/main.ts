import { CognitoCommandSelector } from "./cognito";

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
  console.error(
    "引数に signup, confirm, signin のいずれか一つを指定してください。"
  );
  process.exit(1);
}

const command = args[0];

switch (command) {
  case "signup": {
    const commands = CognitoCommandSelector();
    commands
      .signUp()
      .then((response) => {
        console.log("サインアップに成功。メールを確認してください。", response);
      })
      .catch((error) => {
        console.error(error);
      });
    break;
  }
  case "confirm": {
    if (args.length !== 2) {
      console.error("confirm には第２引数に確認コードを指定してください。");
      process.exit(1);
    }
    const confirmationCode = args[1];
    const commands = CognitoCommandSelector();
    commands
      .confirmSignUp(confirmationCode)
      .then((response) => {
        console.log("認証コードの確認に成功。サインイン可能です。", response);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  case "signin": {
    const commands = CognitoCommandSelector();
    commands
      .signIn()
      .then((session) => {
        console.log("サインインに成功。", session);
      })
      .catch((error) => {
        console.error(error);
      });
    break;
  }
  default: {
    console.error(
      "引数には signup, confirm, signin のいずれか一つを指定してください。"
    );
    process.exit(1);
  }
}
