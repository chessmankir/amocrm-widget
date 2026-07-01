

export type ContactField = {
    id: string;
    name: string;
    values: ContactFieldValue[];
};

export type ContactFieldValue =
    | string
    | {
          value: string;
      };

export type ContactWebhookRDO = {
    success: boolean;
    message: string;
    age?: number;
    contactId?: number;
};
