import { Injectable } from '@angular/core';
import { Userdata } from './userdata.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
private userData: Userdata | null = null;  // allow null

  setUser(data: Userdata) {
    this.userData = data;
  }

  getUser(): Userdata | null{
    return this.userData;
  }
  clearUser() {
    this.userData = null;
    localStorage.removeItem('user');
  }
}