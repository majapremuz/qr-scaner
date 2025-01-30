import { environment } from "src/environments/environment";

interface GeoPoint {
    lat: number,
    lng: number 
}

export class GeoPointObject implements GeoPoint{
    lat: number
    lng: number 

    constructor(data: string){
        let split = data.split(",");
        let lat = split[0].trim();
        let lng = split[1].trim();

        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
    }
}