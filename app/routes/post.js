import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    const postId = params.post_id;
    
    // Return a promise that resolves to both post and comments
    return Ember.RSVP.hash({
      post: this.getPost(postId),
      comments: this.getComments(postId)
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    
    // Set the post and comments on the controller
    controller.set('post', model.post);
    controller.set('comments', model.comments);
    
    // Clear form fields
    controller.set('commentContent', '');
    controller.set('replyContent', '');
    controller.set('showingReplyFormFor', null);
    
    // DEBUG: Log what we're setting
    console.log('DEBUG - setupController setting post:', model.post);
    console.log('DEBUG - setupController setting comments:', model.comments);
  },

  getPost(postId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Use query parameter format that your servlet expects
      Ember.$.ajax({
        url: `http://localhost:8080/reddit_server/api/posts?id=${postId}`,
        method: 'GET',
        success: (response) => {
          console.log('Post loaded:', response);
          resolve(response);
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Failed to load post:', errorThrown);
          console.error('Response status:', jqXHR.status);
          console.error('Response text:', jqXHR.responseText);
          reject(errorThrown);
        }
      });
    });
  },

  getComments(postId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: `http://localhost:8080/reddit_server/api/comments?postId=${postId}`,
        method: 'GET',
        success: (response) => {
          console.log('Comments loaded:', response);
          resolve(response);
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Failed to load comments:', errorThrown);
          // Don't reject if comments fail - just return empty array
          resolve([]);
        }
      });
    });
  },

  actions: {
    refreshModel() {
      this.refresh(); // This will re-run the model hook
    }
  }
});
