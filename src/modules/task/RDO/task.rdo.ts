export type TaskAmo = {
    id: number;
    responsible_user_id: number;
    text: string;
    element_id?: string;
    entity_id: number;
    entity_type: string;
    is_completed: boolean;
    element_type?: string;
    complete_till: number;
    status?: string;
};

export type TaskFilterRDO = {
    _embedded?: {
        tasks: TaskAmo[];
    };
};

export type TaskUpdateWebhookRdo = {
    task?: {
        update?: TaskAmo[];
    };
};

export type TaskResponse = {
    success: boolean;
    message?: string;
};

export type TaskTypesRDO = {
    _embedded?: {
        task_types: TaskTypeAmo[];
    };
};

export type TaskTypeAmo = {
    id: number;
    name: string;
};