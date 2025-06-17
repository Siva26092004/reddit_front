/* global Ember */
export default Ember.Route.extend({
  model(params) {
    const subredditId = params.subreddit_id;
    
    return Ember.RSVP.hash({
      subreddit: new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          url: `http://localhost:8080/reddit_server/api/subreddits?id=${subredditId}`,
          method: 'GET',
          success: (data) => {
            resolve(data);
            console.log('Subreddit loaded:', data);
          },
          error: (err) => {
            console.error('Failed to load subreddit:', err);
            reject(err);
          }
        });
      }),
      posts: new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          url: `http://localhost:8080/reddit_server/api/posts?subreddit_id=${subredditId}`,
          method: 'GET',
          success: (data) => {
            resolve(data);
            console.log('Posts loaded:', data);
          },
          error: (err) => {
            console.error('Failed to load posts for subreddit:', err);
            resolve([]); // Return empty array if posts fail to load
          }
        });
      })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('model', model);
  },

  actions: {
    refreshModel() {
      this.refresh();
    }
  }
});
