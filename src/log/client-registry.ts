interface Client {
    id: string;
    name: string;
}

export class ClientRegistry {
    private clients: Client[] = [];
}
