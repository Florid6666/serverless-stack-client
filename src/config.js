const config = {
  MAX_ATTACHMENT_SIZE: 5000000,
    s3: {
      REGION: "us-east-1",
      BUCKET: "prats-bucket",
    },
    apiGateway: {
      REGION: "us-east-1",
      URL: "https://qxxmaebpg2.execute-api.us-east-1.amazonaws.com/prod",
    },
    cognito: {
      REGION: "us-east-1",
      USER_POOL_ID: "us-east-1_tuMLfJ0Ca",
      APP_CLIENT_ID: "5h3tvgkue7n3lcob1n8m62eo85",
      IDENTITY_POOL_ID: "us-east-1:c40d6d07-dde4-4b5f-8331-5249568eae31",
    },
};

export default config;