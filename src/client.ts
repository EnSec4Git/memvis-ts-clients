import { MapState } from "./mapstate";

export default interface MVClient {
    getMaps(): Promise<MapState>;
    // addMapsEventListener($obj);

}