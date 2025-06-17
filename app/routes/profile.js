import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),

  beforeModel: function() {
    if (!this.get('auth.isAuthenticated')) {
      this.transitionTo('login');
    }
  },

  model: function() {
    var userId = this.get('auth.currentUser.id');
    console.log('Profile Route - Loading profile for user ID:', userId);
    
    return Ember.RSVP.hash({
      user: this.get('auth.currentUser'),
      userPosts: this.fetchUserPosts(userId),
      userSubreddits: this.fetchUserSubreddits(userId)
    });
  },

  fetchUserPosts: function(userId) {
    console.log('Profile Route - Fetching posts for user ID:', userId);
    
    return Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/users/' + userId + '/posts',
      method: 'GET',
      contentType: 'application/json'
    }).then(function(data) {
      console.log('Profile Route - User posts fetched successfully:', data);
      return data.posts || [];
    }, function(error) {
      console.error('Profile Route - Error fetching user posts:', error);
      return [];
    });
  },

  fetchUserSubreddits: function(userId) {
    console.log('Profile Route - Fetching subreddits for user ID:', userId);
    
    return Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/users/' + userId + '/subreddits',
      method: 'GET',
      contentType: 'application/json'
    }).then(function(data) {
      console.log('Profile Route - User subreddits fetched successfully:', data);
      return data.subreddits || [];
    }, function(error) {
      console.error('Profile Route - Error fetching user subreddits:', error);
      return [];
    });
  }
});
