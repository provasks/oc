export class Credential {
  profiles: any;
  attributes: {
    username: string;
    password?: string;
    port: number;
    sudoPassword?: string;
    alias: string;
    priority: string;
    updated?: Date;
    passphrase: string;
    confirmPassphrase: string;
  };
}
