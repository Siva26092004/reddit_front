/* global Ember */
export default Ember.Route.extend({
  queryParams: {
    subreddit_id: {
      refreshModel: true
    }
  },

  model(params) {
    return Ember.RSVP.hash({
      subreddits: new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          url: 'http://localhost:8080/reddit_server/api/subreddits',
          method: 'GET',
          success: (data) => {
            resolve(data);
          },
          error: (err) => {
            console.error('Failed to load subreddits:', err);
            reject(err);
          }
        });
      }),
      preselectedSubreddit: params.subreddit_id ? new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          url: `http://localhost:8080/reddit_server/api/subreddits?id=${params.subreddit_id}`,
          method: 'GET',
          success: (data) => {
            resolve(data);
          },
          error: (err) => {
            console.error('Failed to load preselected subreddit:', err);
            resolve(null);
          }
        });
      }) : null
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('subreddits', model.subreddits);
    
    // Pre-select subreddit if coming from a specific subreddit page
    if (model.preselectedSubreddit) {
      controller.setProperties({
        subredditId: model.preselectedSubreddit.id,
        preselectedSubredditName: model.preselectedSubreddit.name,
        subreddit_id: model.preselectedSubreddit.id.toString()
      });
    } else {
      // Clear preselected subreddit data if not coming from a subreddit
      controller.setProperties({
        preselectedSubredditName: null,
        subreddit_id: null
      });
    }
  }
});
