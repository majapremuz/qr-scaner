import { ImageApiInterface, ImageObject } from "./image";
import { GeoPointObject } from "./geo";


export interface CompanyApiInterface {
    company_id: number
    company_name: string
    company_oib: any
    company_email: string
    company_phone: string
    company_address: any
    company_city: any
    company_zip: any
    company_country: any
    company_coordinates: string
    company_logo: number
    company_note: string
    company_send_content_notification: string
    company_logo_obj: Array<ImageApiInterface>
}

interface CompanyInterface {
    company_id: number
    company_name: string
    company_oib: any
    company_email: string
    company_phone: string
    company_address: any
    company_display_address: string
    company_city: any
    company_zip: any
    company_country: any
    company_coordinates: GeoPointObject | null
    company_has_coordinates: boolean
    company_note: string
    company_send_content_notification: string
    company_image: ImageObject | null
    company_has_image: boolean
}

export class CompanyObject implements CompanyInterface{
    company_id: number
    company_name: string
    company_oib: any
    company_email: string
    company_phone: string
    company_address: any
    company_city: any
    company_zip: any
    company_country: any
    company_coordinates: GeoPointObject | null
    company_note: string
    company_send_content_notification: string
    company_image: ImageObject | null
    company_has_image: boolean
    company_display_address: string
    company_has_coordinates: boolean

    constructor(data: CompanyApiInterface){
        this.company_id = data.company_id;
        this.company_name = data.company_name;
        this.company_oib = data.company_oib;
        this.company_email = data.company_email;
        this.company_phone = data.company_phone;
        this.company_address = data.company_address;
        this.company_city = data.company_city;
        this.company_zip = data.company_zip;
        this.company_country = data.company_country;
        this.company_note = data.company_note;
        this.company_send_content_notification = data.company_send_content_notification;
        this.company_has_image = false;
        this.company_image = null;
        this.company_display_address = '';
        this.company_has_coordinates = false;
        this.company_coordinates = null;

        if(data.company_logo_obj != null){
            let image = new ImageObject(data.company_logo_obj[0]);
            this.company_has_image = true;
            this.company_image = image;
        }

        if(data.company_coordinates != null){
            let point = new GeoPointObject(data.company_coordinates);
            this.company_coordinates = point;
            this.company_has_coordinates = true;
        }

        this.createDisplayAddress();


    }

    createDisplayAddress(){
        this.company_display_address = this.company_address + ', ' + this.company_zip + ' ' + this.company_city;
    }
}