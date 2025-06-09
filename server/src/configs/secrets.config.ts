import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

const secretNames = [
  'DB_PASSWORD',
  'DB_CONNECTION_NAME',
  'DB_USERNAME',
  'DB_DATABASE',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'OPENAI_KEY',
];  

export async function loadSecretsAuto() {
    const projectId = await client.getProjectId();

    const secrets: Record<string, string> = {};
    
    const loads = secretNames.map(async (secretName) => {
        const [version] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
        });

        secrets[secretName] = version.payload?.data?.toString() || '';
    });

    await Promise.all(loads);
    return secrets;
}