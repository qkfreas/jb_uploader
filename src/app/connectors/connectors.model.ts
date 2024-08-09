export interface Connector {
    id: string;
    name: string;
    key: string;
    secret: string;
    endpointEntityId: string;
    functionEntityStartId: string;
    functionEntityEndId: string;
}