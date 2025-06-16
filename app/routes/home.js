
/* global Ember */
export default Ember.Route.extend({
  model() {
    // Fetch both posts and subreddits concurrently
    let postsPromise = Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/posts',
      method: 'GET'
    }).then(
      (data) => data,
      (err) => {
        console.error('Failed to load posts:', err);
        return []; // Return empty array on error
      }
    );

    let subredditsPromise = Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/subreddits',
      method: 'GET'
    }).then(
      (data) => data,
      (err) => {
        console.error('Failed to load subreddits:', err);
        return []; // Return empty array on error
      }
    );
    
   //wait for all promises to resolve
    return Ember.RSVP.hash({
      posts: postsPromise,
      subreddits: subredditsPromise,
      
    });
  },
  actions: {
    refreshModel() {
      this.refresh(); 
    }
  }
});
