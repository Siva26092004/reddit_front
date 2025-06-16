import Ember from 'ember';

export default Ember.Controller.extend({
  auth: Ember.inject.service(),
  
  username: '',
  password: '',
  errorMessage: '',
  isLoading: false,
  actions: {
    login() {
      const { username, password } = this.getProperties('username', 'password');
      this.set('errorMessage', '');
      if (!username || username.trim() === '') {
        this.set('errorMessage', 'Please enter your username');
        return;
      }
      if (!password || password.trim() === '') {
        this.set('errorMessage', 'Please enter your password');
        return;
      }
      this.set('isLoading', true);
      const credentials = {
        username: username.trim(),
        password: password.trim()
      };
      this.get('auth').login(credentials)
        .then((response) => {
          this.setProperties({
            username: '',
            password: '',
            errorMessage: '',
            isLoading: false
          });
          this.get('auth').debugAuthState();
          this.transitionToRoute('home');
        })
        .catch((error) => {
          this.setProperties({
            errorMessage: error.message || 'Login failed. Please try again.',
            isLoading: false
          });
        });
    },
    clearError() {
      this.set('errorMessage', '');
    }
  }
});
