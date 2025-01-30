import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom, lastValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

export interface ApiResult {
  data: any;
  message: string;
  status: boolean;
  status_code: number;
}

export interface ErrorMessage {
  type: AlertType,
  message: string,
  title?: string,
  action?: string
}

export enum AlertType {
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger'
}

const serverURL = environment.rest_server.protokol + environment.rest_server.host;

const TOKEN_KEY = 'access_token';
const TOKEN_KEY_REFRESH = 'refresh_token';
const FCM_TOKEN_KEY = 'fcm_token_key';


const client_id = environment.client_id;
const client_password = environment.client_password;

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  authenticationState = new BehaviorSubject(null);

  loader: any;

  readyPage = new BehaviorSubject<boolean|null>(null);

  home_page_opened: boolean = false;

  getting_new_access_token = false;
  getting_new_access_client_token = false;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private translateCtrl: TranslateService

  ) { }

  async initFunc(){
    await this.platform.ready();
    await this.createStorage();
  }

  setReadyPage(){
    this.readyPage.next(true);
  }

  /**
  * 
  * set if home page is active or inactive
  *
  * @param status true-active, false-inactive
  */
    setHomePage(status: boolean){
      this.home_page_opened = status;
    }

  /**
  * 
  * get if home page is active
  *
  * @returns 
  */
  getHomePageStatus(){
    return this.home_page_opened;
  }

  addParameterToUrl(url: string, parameter_name: string, parameter_value: string): string{

    if(url.includes('?')){
      url = url + '&';
    }else{
      url = url + '?';
    }

    return url + parameter_name + '=' + parameter_value;
  }

  /**
   * 
   * @param url api link
   * @param data to send to server
   * @returns data from server ApiResult object
   */
  async postServer(url: string, data: any): Promise<ApiResult> {
    let access_token = await this.getStorage(TOKEN_KEY);
    let refresh_token = await this.getStorage(TOKEN_KEY_REFRESH);
    let company_id = environment.company_id;

    let promise = new Promise<ApiResult>((resolve, reject) => {
      let apiURL = serverURL + url;
      apiURL = this.addParameterToUrl(apiURL, 'company_id', company_id.toString());
      let options = {};
      if(access_token != null){
        options = {
          headers: new HttpHeaders().append('Authorization', "Bearer " + access_token)
        }
      }else{
        options = {};
      }

      firstValueFrom(
        this.http.post(apiURL, data, options).pipe(take(1))
      )
      .then((res: any) => {
        if(res.status == true && res.data?.valid != false){
          resolve(res.data);
        }else{
          reject({error: {error: 'server_error', error_description: res.message}, data: res.data});
        }
      })
      .catch((err) => {
        if(err.status == 401){
          if(refresh_token != null){
            //this.oauthGetFreshToken()
          }
          else{
            // get offline refresh token
            this.oauthClientAuthorize().then(() =>{
              this.postServer(url, data).then(data_2 => {
                resolve(data_2);
              }).catch((err_2) => {
                reject(err_2);
              });
            }).catch((err_2: any) => {
              reject(err_2);
            });
          }
        }else{
          reject(err);
        }
      })


    });

    return promise;
  }

    /**
   * 
   * @param url api link
   * @param data to send to server
   * @returns data from server ApiResult object
   */
  async putServer(url: string, data: any): Promise<ApiResult> {
    let access_token = await this.getStorage(TOKEN_KEY);
    let refresh_token = await this.getStorage(TOKEN_KEY_REFRESH);
    let company_id = environment.company_id;

    let promise = new Promise<ApiResult>((resolve, reject) => {
      let apiURL = serverURL + url;
      apiURL = this.addParameterToUrl(apiURL, 'company_id', company_id.toString());
      let options = {};
      if(access_token != null){
        options = {
          headers: new HttpHeaders().append('Authorization', "Bearer " + access_token)
        }
      }else{
        options = {};
      }

      firstValueFrom(
        this.http.put(apiURL, data, options).pipe(take(1))
      )
      .then((res: any) => {
        if(res.status == true && res.data?.valid != false){
          resolve(res.data);
        }else{
          reject({error: {error: 'server_error', error_description: res.message}, data: res.data});
        }
      })
      .catch((err) => {
        if(err.status == 401){
          if(refresh_token != null){
            //this.oauthGetFreshToken()
          }
          else{
            // get offline refresh token
            this.oauthClientAuthorize().then(() =>{
              this.postServer(url, data).then(data_2 => {
                resolve(data_2);
              }).catch((err_2) => {
                reject(err_2);
              });
            }).catch((err_2: any) => {
              reject(err_2);
            });
          }
        }else{
          reject(err);
        }
      })


    });

    return promise;
  }

  /**
   * 
   * @param url api link
   * @returns data from server ApiResult object
   */
  async deleteServer(url: string): Promise<ApiResult> {
    let access_token = await this.getStorage(TOKEN_KEY);
    let refresh_token = await this.getStorage(TOKEN_KEY_REFRESH);
    let company_id = environment.company_id;

    let promise = new Promise<ApiResult>((resolve, reject) => {
      let apiURL = serverURL + url;
      apiURL = this.addParameterToUrl(apiURL, 'company_id', company_id.toString());
      let options = {};
      if(access_token != null){
        options = {
          headers: new HttpHeaders().append('Authorization', "Bearer " + access_token)
        }
      }else{
        options = {};
      }

      firstValueFrom(
        this.http.delete(apiURL, options).pipe(take(1))
      )
      .then((res: any) => {
        if(res.status == true && res.data?.valid != false){
          resolve(res.data);
        }else{
          reject({error: {error: 'server_error', error_description: res.message}, data: res.data});
        }
      })
      .catch((err) => {
        if(err.status == 401){
          if(refresh_token != null){
            //this.oauthGetFreshToken()
          }
          else{
            // get offline refresh token
            this.oauthClientAuthorize().then(() =>{
              this.deleteServer(url).then(data_2 => {
                resolve(data_2);
              }).catch((err_2) => {
                reject(err_2);
              });
            }).catch((err_2: any) => {
              reject(err_2);
            });
          }
        }else{
          reject(err);
        }
      })


    });

    return promise;
  }

  /**
   * 
   * @param url api link
   * @param cache if true than the cache is enable
   * @param cache_time the cache time in seconds
   * @returns the data from server ApiResult object
   */
  async getServer(url: string, cache: boolean = false, cache_time: number = 5): Promise<ApiResult> {
    cache_time = cache_time * 1000; //convert to miliseconds
    let access_token = await this.getStorage(TOKEN_KEY);
    let refresh_token = await this.getStorage(TOKEN_KEY_REFRESH);
    let cachedData = await this.checkCache(environment.cache_key + url, cache_time).catch(err => {return undefined;});
    let company_id = environment.company_id;

    if(cache == true){
      if(environment.cache == false){
        cache = false;
      }
    }

    let promise = new Promise<ApiResult>((resolve, reject) => {
      let apiURL = serverURL + url;
      apiURL = this.addParameterToUrl(apiURL, 'company_id', company_id.toString());
      let options = {};
      if(access_token != null){
        options = {
          headers: new HttpHeaders().append('Authorization', "Bearer " + access_token)
        }
      }else{
        options = {};
      }

      if(cache == true && cachedData != undefined){
        if(cachedData.status == true && cachedData.data?.valid != false){
          resolve(cachedData.data);
        }else{
          reject({error: {error: 'server_error', error_description: cachedData.message}, data: cachedData.data});
        }
      }else{

        firstValueFrom(
          this.http.get(apiURL, options).pipe(take(1))
        )
        .then((res: any) => {
          if(cache == true){
            let miliseconds = Date.now();

            let cache_data = {
              key: environment.cache_key + url,
              miliseconds: miliseconds,
              res: res
            };

            this.setStorage(cache_data.key, JSON.stringify(cache_data)).then(() => {
              if(res.status == true && res.data?.valid != false){
                resolve(res.data);
              }else{
                reject({error: {error: 'server_error', error_description: res.message}, data: res.data});
              }
            });
          }
          else{
            if(res.status == true && res.data?.valid != false){
              resolve(res.data);
            }else{
              reject({error: {error: 'server_error', error_description: res.message}, data: res.data});
            }
          }
        })
        .catch((err) => {
          if(err.status == 401){
            if(refresh_token != null){
              //this.oauthGetFreshToken()
            }
            else{
              // get offline refresh token
              this.oauthClientAuthorize().then(() =>{
                this.getServer(url, cache, cache_time).then(data_2 => {
                  resolve(data_2);
                }).catch((err_2) => {
                  reject(err_2);
                });
              }).catch((err_2: any) => {
                reject(err_2);
              });
            }
          }else{
            reject(err);
          }
        })
      }
    });

    return promise;
  }


  async parseErrorMessage(error: any): Promise<ErrorMessage>{
    let errorMessage: ErrorMessage = {title: '', message: '', type: AlertType.Warning};
    let sub_error = error?.error || undefined;

    if(sub_error != undefined){
      let sub_error_title = sub_error?.error || undefined;
      let sub_error_description = sub_error?.error_description || undefined;
      errorMessage.type = AlertType.Warning;

      if(sub_error_title != undefined){
        errorMessage.title = sub_error_title;
      }else{
        errorMessage.title = 'unknown error';
      }

      if(sub_error_description != undefined){
        errorMessage.message = sub_error_description;
      }else{
        errorMessage.title = 'unknown error';
      }

      if(sub_error_title == 'invalid_client'){
        //"The client credentials are invalid"
      }
      else if(sub_error_title == 'the token did not arrive'){
        errorMessage.title = 'Unauthorized';
        errorMessage.message = 'Unauthorized';
        errorMessage.type = AlertType.Warning;
      }

      return errorMessage;

    }
    else{
      errorMessage.title = 'unknown error';
      errorMessage.message = 'unknown error';
      errorMessage.type = AlertType.Warning;
      return errorMessage;
    }
  }


  async oauthClientAuthorize(){
    await this.platform.ready();
    let serverUrl_token = serverURL + environment.rest_server.functions.token;

    let promise = new Promise((res, rej) => {
      if(!this.getting_new_access_client_token) {
        this.getting_new_access_client_token = true;
  
        // create the data to be posted
        var postObj = {
          grant_type: 'client_credentials',
          client_id: client_id,
          client_secret: client_password
        };

        firstValueFrom(
          this.http.post(serverUrl_token, postObj).pipe(take(1))
        )
        .then((data: any) => {
          this.setStorage(TOKEN_KEY, data['access_token']).then(() => {
            this.getting_new_access_client_token = false;
            res(true);
          });
        })
        .catch((err) => {
          // it is imposible to get the offline token
          rej(err);
        });  
      }else{
        // we are already getting a new token, lets just wait untill we get the new one and resolve the promise
        let ticker = setInterval(()=>{
          if(!this.getting_new_access_client_token) {
            clearInterval(ticker);
            res(true);
          }else{
            rej(new Error('the token did not arrive'));
          }
        },300);
      }
    });
    return promise;
  }


  private checkCache(key: string, cache_time: number): Promise<ApiResult>{
    let promise = new Promise<ApiResult>((resolve, reject) => {
        this.getStorage(key).then(data_str => {
          if(data_str != null){
            let data = JSON.parse(data_str);
            let timeNow = Date.now();
            if(data.miliseconds + cache_time >= timeNow){
              resolve(data.res);
            }
            else{
              reject(new Error("cache data expired"));
            }
          }
          else{
            reject(new Error("cache data not exist"));
          }
        }).catch(() =>{ 
          reject(new Error("cache data read error"));
        });
    });
    return promise;
  }

  translateWord(key: string): Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
      this.translateCtrl.get(key).toPromise().then( value => {
        resolve(value);
        }
      );
    });
    return promise;
  }

  async showToast(message: string, color: AlertType = AlertType.Success) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }

  async showLoader(): Promise<void> {
    this.loader = await this.loadingCtrl.create({
      spinner: 'circles',
    });

    this.loader.present();
  }

  async hideLoader(): Promise<void>{
    await this.loader.dismiss();
    this.loader = null;
  }

  async setStorage($key: string, $data: string){
    return await this.storage.set($key, $data);
  }

  async getStorage($key: string){
      return await this.storage.get($key);
  }

  async removeStorage($key: string){
    return await this.storage.remove($key);
  }

  async createStorage(){
    return await this.storage.create();
  }
}


