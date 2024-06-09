import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandOutput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
} from "amazon-cognito-identity-js";

if (process.env.AWS_REGION === undefined) {
  throw new Error("AWS_REGION is not set");
}

if (process.env.USER_POOL_ID === undefined) {
  throw new Error("USER_POOL_ID is not set");
}

if (process.env.CLIENT_ID === undefined) {
  throw new Error("CLIENT_ID is not set");
}

if (process.env.USER_EMAIL === undefined) {
  throw new Error("USER_EMAIL is not set");
}

if (process.env.TEMPORARY_PASSWORD === undefined) {
  throw new Error("TEMPORARY_PASSWORD is not set");
}

const AWS_REGION: string = process.env.AWS_REGION;
const USER_POOL_ID: string = process.env.USER_POOL_ID;
const CLIENT_ID: string = process.env.CLIENT_ID;
const USER_EMAIL: string = process.env.USER_EMAIL;
const TEMPORARY_PASSWORD: string = process.env.TEMPORARY_PASSWORD;

const _client = new CognitoIdentityProviderClient({ region: AWS_REGION });
const _userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

export type CognitoCommands = {
  signUp: () => Promise<SignUpCommandOutput>;
  confirmSignUp: (
    confirmationCode: string
  ) => Promise<ConfirmSignUpCommandOutput>;
  signIn: () => Promise<CognitoUserSession>;
};

export function CognitoCommandSelector(): CognitoCommands {
  /**
   * ユーザを登録します。確認コードが届くため、USER_EMAIL にはメール受信可能なアドレスを指定してください。
   * @returns
   */
  const signUp = async (): Promise<SignUpCommandOutput> => {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: USER_EMAIL,
      Password: TEMPORARY_PASSWORD,
      UserAttributes: [
        {
          Name: "email",
          Value: USER_EMAIL,
        },
      ],
    });
    try {
      const response = await _client.send(command);
      console.log("Sign up successful:", response);
      return response;
    } catch (error) {
      console.error("Error signing up:", error);
      return Promise.reject(error);
    }
  };

  /**
   * 登録したメールアドレスに届いた確認コードを使って、ユーザ登録を完了します。
   * @param confirmationCode
   * @returns
   */
  const confirmSignUp = async (
    confirmationCode: string
  ): Promise<ConfirmSignUpCommandOutput> => {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: USER_EMAIL,
      ConfirmationCode: confirmationCode,
    });
    try {
      const response = await _client.send(command);
      console.log("Sign up confirmation successful:", response);
      return response;
    } catch (error) {
      console.error("Error confirming sign up:", error);
      return Promise.reject(error);
    }
  };

  /**
   * サインインします。
   * @returns
   */
  const signIn = async (): Promise<CognitoUserSession> => {
    const cognitoUser = new CognitoUser({
      Username: USER_EMAIL,
      Pool: _userPool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: USER_EMAIL,
      Password: TEMPORARY_PASSWORD,
    });

    return new Promise<CognitoUserSession>((resolve, reject) => {
      const handler: IAuthenticationCallback = {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          console.error("Authentication failed:", err);
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log("New password required");
          // 新しいパスワードの設定が必要な場合は、ここでハンドルします
          // 通常、ユーザーから新しいパスワードを入力させ、以下を実行します
          const newPassword = "new_password_user_chooses";
          cognitoUser.completeNewPasswordChallenge(
            newPassword,
            userAttributes,
            handler
          );
        },
      };
      // SRP認証を開始
      cognitoUser.authenticateUser(authenticationDetails, handler);
    });
  };

  return {
    signUp,
    confirmSignUp,
    signIn,
  };
}
