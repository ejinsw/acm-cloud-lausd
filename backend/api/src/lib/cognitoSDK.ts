import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

export const cognito = new CognitoIdentityProvider({
    region: process.env.COGNITO_REGION, 
});
