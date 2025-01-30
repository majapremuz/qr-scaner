import { DateService } from './date';
import { ImageApiInterface, ImageObject } from "./image";
import { CompanyApiInterface, CompanyObject } from "./company";
import { UserApiInterface } from "./user";

let dateService = new DateService();

export interface ContentApiInterface {
    content_id: number
    content_uid: number
    content_company: number
    content_create: string
    content_name: string
    content_type: string
    content_user_permission: number
    content_parent: any
    content_main_group: number
    content_image: number
    content_public_date: any
    content_show_autor: string
    content_show_date: string
    content_archive: string
    content_attachment_key: number
    content_description: any
    segments: any[]
    content_image_obj: ImageApiInterface
    content_company_id_obj: CompanyApiInterface[]
    content_uid_obj: UserApiInterface[]
    moderators: any
    content_path: string
    content_parent_level: number
    content_has_child: boolean
}

interface ContentInterface {
    content_id: number
    content_uid: number
    content_create: string
    content_name: string
    content_type: ContentType
    content_user_permission: number
    content_parent: ContentObject | null
    content_main_group: number
    content_public_date: string | null
    content_show_autor: boolean
    content_show_date: boolean
    content_archive: boolean
    content_attachment_key: number
    content_description: string | null
    segments: any[]
    content_image_obj: ImageObject | null
    content_has_image: boolean
    content_company_id_obj: CompanyObject | null
    content_uid_obj: UserApiInterface | null
    moderators: any
    content_path: string
    content_parent_level: number
    content_has_child: boolean
}

enum ContentType {
    Content = 'content',
    Category = 'category'
}

export class ContentObject implements ContentInterface{
    content_id: number
    content_uid: number
    content_create: string
    content_name: string
    content_type: ContentType
    content_user_permission: number
    content_parent: ContentObject | null
    content_main_group: number
    content_public_date: string | null
    content_show_autor: boolean
    content_show_date: boolean
    content_archive: boolean
    content_attachment_key: number
    content_description: string | null
    segments: any[]
    content_image_obj: ImageObject | null
    content_has_image: boolean
    content_company_id_obj: CompanyObject | null
    content_uid_obj: UserApiInterface | null
    moderators: any
    content_path: string
    content_parent_level: number
    content_has_child: boolean

    constructor(data: ContentApiInterface){
        this.content_id = data.content_id;
        this.content_uid = data.content_uid;
        this.content_name = data.content_name;
        this.content_user_permission = data.content_user_permission;
        this.content_main_group = data.content_main_group;
        this.content_attachment_key = data.content_attachment_key;
        this.content_description = data.content_description;
        this.segments = data.segments;
        this.moderators = data.moderators;
        this.content_path = data.content_path;
        this.content_parent_level = data.content_parent_level;
        this.content_show_autor = (data.content_show_autor == 'N' ? false : true);
        this.content_show_date = (data.content_show_date == 'N' ? false : true);
        this.content_archive = (data.content_archive == 'N' ? false : true);
        this.content_has_child = (data.content_has_child == false ? false : true);
        this.content_create = dateService.dbDateToDateTime(data.content_create);
        this.content_public_date = (data.content_public_date != null ? dateService.dbDateToDateTime(data.content_public_date): null);
        this.content_type = ContentType.Content;
        this.content_parent = null;
        this.content_image_obj = null;
        this.content_company_id_obj = null;
        this.content_uid_obj = null;
        this.content_has_image = false;


        if(data.content_type != null){
            if(data.content_type == 'content'){
                this.content_type = ContentType.Content;
            }else{
                this.content_type = ContentType.Category;
            }
        }

        if(data.content_parent != null){
            this.content_parent = new ContentObject(data.content_parent);
        }

        if(data.content_image_obj != null){
            this.content_image_obj = new ImageObject(data.content_image_obj);
        }

        if(data.content_company_id_obj != null){
            this.content_company_id_obj = new CompanyObject(data.content_company_id_obj[0]);
        }

        if(data.content_image_obj != null){
            this.content_image_obj = new ImageObject(data.content_image_obj);
            this.content_has_image = true;
        }else{
            this.content_has_image = false;
        }

        if(data.content_uid_obj != null){
            this.content_uid_obj = data.content_uid_obj[0];
        }

    }
}