import { Injectable } from '@angular/core';
import { Userdata } from './userdata.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private userData!: Userdata;

  setUser(data: Userdata) {
    this.userData = data;
  }

  getUser(): Userdata {
    return this.userData;
  }
}