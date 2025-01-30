import { ImageApiInterface, ImageObject } from "./image";


export interface UserApiInterface {
    user_id: number
    user_access_permission: number
    user_firstname: string
    user_lastname: string
    user_email: string
    user_phone: string
    user_address: string
    user_city: string
    user_zip: any
    user_country: string
    user_note: string
    user_timezone: string
    user_language: string
    user_expire: string
    user_date: string
    user_email_change_date: any
    user_verify: string
    user_ban: string
    user_active_company: number
    user_display_name: string
    user_display_title: string
    user_display_text: string
    user_display_image: number
    user_display_mobile: string
    user_display_phone: any
    user_display_email: string
    user_display_attachment_key: number
    user_app: string
  }