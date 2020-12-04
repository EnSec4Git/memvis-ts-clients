import { MapState } from "./mapstate";

export default interface MVClient {
    getMaps(): Promise<MapState>;
    getPtrSize(): Promise<number>;
    ptrSize?: number;
    // addMapsEventListener($obj);

}