import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    openPost: function(postId) {
      // Navigate to post detail page if you have one
      this.transitionToRoute('post', postId);
    },

    goToSubreddit: function(subredditId) {
      // Navigate to subreddit page if you have one
      this.transitionToRoute('subreddit', subredditId);
    }
  }
});
