import Ember from 'ember';

export default Ember.Controller.extend({
  auth: Ember.inject.service(),

  actions: {
    logout() {
      this.get('auth').logout();
      this.transitionToRoute('home');
    }
  }
});
