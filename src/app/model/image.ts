import { environment } from "src/environments/environment";

export interface ImageApiInterface {
    attachment_id: number
    attachment_key_id: number
    attachment_attachment_id: number
    attachment_uid: number
    attachment_create: string
    multimedia_id: number
    multimedia_type: number
    multimedia_owner: number
    multimedia_name: any
    multimedia_description: any
    multimedia_file: string
    multimedia_file_old: string
    multimedia_thumbnail: any
    multimedia_thumbnail2x: any
    multimedia_mime: string
    multimedia_access_permission: any
}

interface ImageInterface {
    multimedia_id: number
    multimedia_type: number
    multimedia_name: any
    multimedia_description: any
    multimedia_file: string
    multimedia_file_old: string
    multimedia_thumbnail: any
    multimedia_thumbnail2x: any
    multimedia_mime: string
    multimedia_access_permission: any
    full_url_thumbnail2x: string
    full_url: string
    image: boolean
    display_name: string
}

enum MultimediaMime {
    png  = 'image/png',
    jpg  = 'image/jpg',
    jpeg = 'image/jpeg',
    gif  = 'image/gif'
}

export class ImageObject implements ImageInterface{
    multimedia_id: number
    multimedia_type: number
    multimedia_name: any
    multimedia_description: any
    multimedia_file: string
    multimedia_file_old: string
    multimedia_thumbnail: any
    multimedia_thumbnail2x: any
    multimedia_mime: string
    multimedia_access_permission: any
    full_url_thumbnail2x: string
    full_url: string
    image: boolean
    display_name: string

    doc_icon: string = 'assets/imgs/document.png';

    constructor(data: ImageApiInterface){
        this.multimedia_id = data.multimedia_id;
        this.multimedia_type = data.multimedia_type;
        this.multimedia_name = data.multimedia_name;
        this.multimedia_description = data.multimedia_description;
        this.multimedia_file = data.multimedia_file;
        this.multimedia_file_old = data.multimedia_file_old;
        this.multimedia_thumbnail = data.multimedia_thumbnail;
        this.multimedia_thumbnail2x = data.multimedia_thumbnail2x;
        this.multimedia_mime = data.multimedia_mime;
        this.multimedia_access_permission = data.multimedia_access_permission;
        this.full_url_thumbnail2x = '';
        this.full_url = '';
        this.image = false;
        this. display_name = '';

        this.getPath();
        this.getName();

    }

    getName(){
        if(this.multimedia_file_old == null || this.multimedia_file_old == ''){
            this.display_name = this.multimedia_file;
        }else{
            this.display_name = this.multimedia_file_old
        }
    }

    getPath(){
        if(this.multimedia_mime == MultimediaMime.png || this.multimedia_mime == MultimediaMime.jpg || this.multimedia_mime == MultimediaMime.jpeg || this.multimedia_mime == MultimediaMime.gif){
            this.full_url = environment.rest_server.protokol + environment.rest_server.host + environment.rest_server.multimedia + '/original/' + this.multimedia_file;

            this.full_url_thumbnail2x = environment.rest_server.protokol + environment.rest_server.host + environment.rest_server.multimedia + '/thumbnail2x/' + this.multimedia_file;

            this.image = true;
          }
          else{
            this.full_url = environment.rest_server.protokol + environment.rest_server.host + environment.rest_server.multimedia + '/' + this.multimedia_file;
            this.image = false;
          }
    }
}