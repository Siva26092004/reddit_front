import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  beforeModel() {
    // Debug auth state on app startup
    console.log('Application Route - beforeModel - Auth state:');
    this.get('auth').debugAuthState();
  },
  model() {
    // Ensure auth service is loaded
    return this.get('auth');
  }
});
