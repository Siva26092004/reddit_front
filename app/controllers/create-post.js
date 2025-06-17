/* global Ember */
export default Ember.Controller.extend({
  queryParams: ['subreddit_id'],
  subreddit_id: null,
  
  title: '',
  content: '',
  subredditId: null,
  mediaFile: null,
  isLoading: false,
  subreddits: [],
  preselectedSubredditName: null,

  // Watch for changes in subreddit_id query param
  subredditIdObserver: Ember.observer('subreddit_id', function() {
    const subredditId = this.get('subreddit_id');
    if (subredditId) {
      this.set('subredditId', parseInt(subredditId));
    }
  }),

  actions: {
    handleFileChange(event) {
      const file = event.target.files[0];
      this.set('mediaFile', file);
    },

    createPost() {
      const title = this.get('title');
      const content = this.get('content');
      const subredditId = this.get('subredditId');
      const mediaFile = this.get('mediaFile');
      const userId = 1; // You can get this from auth service later

      if (!title || !content || !subredditId) {
        alert('Please fill in all required fields and select a subreddit.');
        return;
      }

      this.set('isLoading', true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('userId', userId.toString());
      formData.append('subredditId', subredditId.toString());

      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }

      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/posts',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: (response) => {
          console.log('Post created successfully:', response);
          alert('Post created successfully!');
          
          // Clear form
          this.setProperties({
            title: '',
            content: '',
            mediaFile: null,
            isLoading: false
          });

          // Navigate back to the subreddit if we came from one, otherwise go to home
          if (this.get('preselectedSubredditName')) {
            this.transitionToRoute('subreddit', this.get('subredditId'));
          } else {
            this.transitionToRoute('home');
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          this.set('isLoading', false);
          const errorMessage = jqXHR.responseText ? JSON.parse(jqXHR.responseText).error : errorThrown || 'Unknown error';
          console.error('Failed to create post:', errorMessage);
          alert(`Failed to create post: ${errorMessage}`);
        }
      });
    },

    cancelPost() {
      // Navigate back to the subreddit if we came from one, otherwise go to home
      if (this.get('preselectedSubredditName')) {
        this.transitionToRoute('subreddit', this.get('subredditId'));
      } else {
        this.transitionToRoute('home');
      }
    }
  }
});
