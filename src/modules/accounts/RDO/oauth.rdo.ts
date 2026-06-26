export type AccountInstallRDO = {
    code: string;
    referer: string;
    platform: string;
    client_id: string;
    from_widget: string;
};

export type AccountUninstallRDO = {
    client_uuid: string;
    account_id: string;
    signature: string;
    hook_reason: string;
};

export type AmoResponse = {
    success: boolean;
    message: string;
};
