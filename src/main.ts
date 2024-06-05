import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

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

const createUser = async () => {
  const command = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: USER_EMAIL,
    UserAttributes: [
      {
        Name: "email",
        Value: USER_EMAIL,
      },
    ],
    TemporaryPassword: TEMPORARY_PASSWORD,
    //   MessageAction: "SUPPRESS",
  });

  try {
    const response = await _client.send(command);
    console.log("User created:", response);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

const signIn = async () => {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: USER_EMAIL,
      PASSWORD: TEMPORARY_PASSWORD,
    },
    ClientId: CLIENT_ID,
  });

  try {
    const response = await _client.send(command);
    console.log("Sign in successful:", response);
    return response.AuthenticationResult; // 認証結果を返す
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

createUser();
// signIn();

/*

Error creating user: ResourceNotFoundException: User pool ap-northeast-1_4RFy3T2r1 does not exist.
    at de_ResourceNotFoundExceptionRes (/Users/yusuke/.yarn/berry/cache/@aws-sdk-client-cognito-identity-provider-npm-3.590.0-a7874b5e1d-10c0.zip/node_modules/@aws-sdk/client-cognito-identity-provider/dist-cjs/index.js:4106:21)
    at de_CommandError (/Users/yusuke/.yarn/berry/cache/@aws-sdk-client-cognito-identity-provider-npm-3.590.0-a7874b5e1d-10c0.zip/node_modules/@aws-sdk/client-cognito-identity-provider/dist-cjs/index.js:3775:19)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async /Users/yusuke/.yarn/berry/cache/@smithy-middleware-serde-npm-3.0.0-47c903c77e-10c0.zip/node_modules/@smithy/middleware-serde/dist-cjs/index.js:35:20
    at async /Users/yusuke/.yarn/berry/cache/@smithy-core-npm-2.2.0-bbe256b9d4-10c0.zip/node_modules/@smithy/core/dist-cjs/index.js:165:18
    at async /Users/yusuke/.yarn/berry/cache/@smithy-middleware-retry-npm-3.0.3-86a38f08db-10c0.zip/node_modules/@smithy/middleware-retry/dist-cjs/index.js:320:38
    at async /Users/yusuke/.yarn/berry/cache/@aws-sdk-middleware-logger-npm-3.577.0-d0b5411681-10c0.zip/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:34:22 {
  '$fault': 'client',
  '$metadata': {
    httpStatusCode: 400,
    requestId: 'df522166-2b03-4124-8e70-bd20bafa07c7',
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0
  },
  __type: 'ResourceNotFoundException'
}

*/
