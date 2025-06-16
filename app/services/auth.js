import Ember from 'ember';

export default Ember.Service.extend({
  isAuthenticated: false,
  currentUser: null,

  init() {
    this._super(...arguments);
    this.loadUserFromStorage();
  },

  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('currentUser');
      console.log('Auth Service - Loading user from storage:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Auth Service - Parsed user data:', user);
        
        if (user && user.id) {
          this.setProperties({
            isAuthenticated: true,
            currentUser: user
          });
          console.log('Auth Service - User loaded successfully:', user);
        } else {
          console.log('Auth Service - Invalid user data, clearing storage');
          this.clearUserData();
        }
      } else {
        console.log('Auth Service - No user data found in storage');
      }
    } catch (error) {
      console.error('Auth Service - Error loading user from storage:', error);
      this.clearUserData();
    }
  },

  saveUserToStorage(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Auth Service - User saved to storage:', user);
    } catch (error) {
      console.error('Auth Service - Error saving user to storage:', error);
    }
  },

  clearUserData() {
    localStorage.removeItem('currentUser');
    this.setProperties({
      isAuthenticated: false,
      currentUser: null
    });
    console.log('Auth Service - User data cleared');
  },

  login(credentials) {
    console.log('Auth Service - Attempting login with:', credentials);
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(credentials),
        success: (response) => {
          console.log('Auth Service - Login successful:', response);
          
          // Handle the proper response format from updated server
          if (response && response.user && response.user.id) {
            const user = response.user;
            
            this.setProperties({
              isAuthenticated: true,
              currentUser: user
            });
            
            this.saveUserToStorage(user);
            resolve(response);
            
          } else {
            console.error('Auth Service - Invalid login response format:', response);
            reject(new Error('Invalid response format from server'));
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Auth Service - Login failed:', {
            status: jqXHR.status,
            statusText: textStatus,
            error: errorThrown,
            response: jqXHR.responseText
          });
          
          let errorMessage = 'Login failed';
          try {
            if (jqXHR.responseText) {
              const errorResponse = JSON.parse(jqXHR.responseText);
              errorMessage = errorResponse.error || errorResponse.message || errorMessage;
            }
          } catch (parseError) {
            errorMessage = errorThrown || textStatus || errorMessage;
          }
          
          reject(new Error(errorMessage));
        }
      });
    });
  },

  register(userData) {
    console.log('Auth Service - Attempting registration with:', userData);
    
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: (response) => {
          console.log('Auth Service - Registration successful:', response);
          
          // Handle the proper response format from updated server
          if (response && response.user && response.user.id) {
            const user = response.user;
            
            this.setProperties({
              isAuthenticated: true,
              currentUser: user
            });
            
            this.saveUserToStorage(user);
            resolve(response);
            
          } else {
            console.error('Auth Service - Invalid registration response format:', response);
            reject(new Error('Invalid response format from server'));
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Auth Service - Registration failed:', {
            status: jqXHR.status,
            statusText: textStatus,
            error: errorThrown,
            response: jqXHR.responseText
          });
          
          let errorMessage = 'Registration failed';
          try {
            if (jqXHR.responseText) {
              const errorResponse = JSON.parse(jqXHR.responseText);
              errorMessage = errorResponse.error || errorResponse.message || errorMessage;
            }
          } catch (parseError) {
            errorMessage = errorThrown || textStatus || errorMessage;
          }
          
          reject(new Error(errorMessage));
        }
      });
    });
  },

  getCurrentUserId() {
    const userId = this.get('currentUser.id');
    console.log('Auth Service - getCurrentUserId called, returning:', userId);
    return userId;
  },

  getCurrentUser() {
    const user = this.get('currentUser');
    console.log('Auth Service - getCurrentUser called, returning:', user);
    return user;
  },

  logout() {
    console.log('Auth Service - Logging out user');
    this.clearUserData();
  },

  debugAuthState() {
    console.log('=== AUTH SERVICE DEBUG ===');
    console.log('isAuthenticated:', this.get('isAuthenticated'));
    console.log('currentUser:', this.get('currentUser'));
    console.log('localStorage data:', localStorage.getItem('currentUser'));
    console.log('getCurrentUserId():', this.getCurrentUserId());
   console.log('========================');
  }
});
