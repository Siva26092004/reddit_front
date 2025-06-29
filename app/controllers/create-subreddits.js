// subreddits.js controller - for viewing and creating subreddits
/* global Ember */
export default Ember.Controller.extend({
   auth: Ember.inject.service(),
  subreddits: [],
  name: '',
  description: '',
  init() {
    this._super(...arguments);
    this.loadSubreddits();
  
  },
  actions: {
    createSubreddit() {
      const { name, description } = this.getProperties('name', 'description');
     const created_by = this.get('auth').getCurrentUserId().toString();
      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/subreddits',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name, description, created_by}),
        success: () => {
          alert('Subreddit created successfully');
          this.setProperties({ name: '', description: '' });
          this.loadSubreddits(); // Refresh the list
        },
        error: (err) => {
          alert('Failed to create subreddit: ' + err.responseText);
        }
      });
    },
    loadSubreddits() {
      this.loadSubreddits();
    }
  },
  loadSubreddits() {
    Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/subreddits',
      method: 'GET',
      success: (data) => {
        this.set('subreddits', data);
      },
      error: (err) => {
        console.error('Failed to load subreddits:', err);
      }
    });
  }
});
