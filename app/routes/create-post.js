import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),

  beforeModel() {
    if (!this.get('auth.isAuthenticated')) {
      alert('Please log in to create a post');
      this.transitionTo('login');
    }
  }
});
