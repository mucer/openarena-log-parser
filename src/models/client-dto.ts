export interface ClientDto {
    id: number;
    hwId: string;
    personId: number | null;
    personName: string | null;
    names: { name: string, count: number }[];
}
