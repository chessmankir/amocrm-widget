export type CreateTaskPayload = {
    text: string;
    entity_id: number;
    entity_type: string;
    complete_till: number;
    responsible_user_id: number;
    task_type_id: number;
};

export type AmoUpdateLead = {
    price?: number;
};
