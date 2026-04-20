export interface Mention {
    id: string;
    index: number;
    length: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
}

export interface Attachment {
    id: string;
    filename: string;
    extension: string;
    url: string;
    media_type: string;
    sub_type: string;
    size: number;
}

export interface Team {
    id: string;
    name: string;
    organization: string;
}

export interface Task {
    description: string;
    state: "todo" | "in_progress" | "closed";
    due_at: number | null;
    started_at: number | null;
    closed_at: number | null;
    assignees: User[];
    team: Team | null;
}

export interface Comment {
    id: string;
    body: string;
    created_at: number;
    mentions: Mention[];
    author: User;
    attachment?: Attachment;
    task: Task | null;
}