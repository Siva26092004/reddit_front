/* global Ember */
export default Ember.Controller.extend({
  auth: Ember.inject.service(),
  
  title: '',
  content: '',
  subredditId: 1,
  mediaFile: null,
  subreddits: [],
  isLoading: false,
  errorMessage: '',

  init(){
    this._super(...arguments);
    this.loadSubreddits();
  },
  parseErrorResponse(jqXHR, textStatus, errorThrown) {
    let errorMessage = 'Unknown error occurred';
    try {
      if (jqXHR.responseText) {
        const errorResponse = JSON.parse(jqXHR.responseText);
        errorMessage = errorResponse.error || errorResponse.message || errorMessage;
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      console.error('Raw response text:', jqXHR.responseText);
      if (jqXHR.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (jqXHR.responseText) {
        errorMessage = `Server error: ${jqXHR.responseText}`;
      } else {
        errorMessage = errorThrown || textStatus || 'Network error occurred';
      }
    }
    return errorMessage;
  },
  actions: {
    createPost() {
      this.get('auth').debugAuthState();
      const isAuthenticated = this.get('auth.isAuthenticated');
      console.log('Is authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        this.set('errorMessage', 'Please log in to create a post');
        this.transitionToRoute('login');
        return;
      }
      const { title, content, subredditId, mediaFile } = this.getProperties('title', 'content', 'subredditId', 'mediaFile');
      const userId = this.get('auth').getCurrentUserId();
      const currentUser = this.get('auth').getCurrentUser();
      this.set('errorMessage', '');
      if (!title || title.trim() === '') {
        this.set('errorMessage', 'Please enter a title');
        return;
      }
      if (!content || content.trim() === '') {
        this.set('errorMessage', 'Please enter content');
        return;
      }
      if (!subredditId) {
        this.set('errorMessage', 'Please select a subreddit');
        return;
      }

      if (!userId) {
        console.error('User ID is null/undefined. Auth state:');
        this.get('auth').debugAuthState();
        this.set('errorMessage', 'Authentication error. Please log in again.');
        this.transitionToRoute('login');
        return;
      }

      // Set loading state
      this.set('isLoading', true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('userId', parseInt(userId));
      formData.append('subredditId', parseInt(subredditId));
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }
      console.log('Sending FormData with:');
      console.log('- title:', title.trim());
      console.log('- content:', content.trim());
      console.log('- userId:', parseInt(userId));
      console.log('- subredditId:', parseInt(subredditId));
      console.log('- mediaFile:', mediaFile ? mediaFile.name : 'none');

      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/posts', 
        method: 'POST',
        processData: false, 
        contentType: false, 
        data: formData,
        success: (response) => {
          console.log('Post created successfully:', response);
          this.setProperties({ 
            title: '', 
            content: '', 
            mediaFile: null,
            isLoading: false,
            errorMessage: ''
          });
          const fileInput = document.getElementById('mediaFile');
          if (fileInput) {
            fileInput.value = '';
          }
          alert('Post created successfully!');
          this.transitionToRoute('home');
        },
        error: (jqXHR, textStatus, errorThrown) => {
          this.set('isLoading', false);
          const errorMessage = this.parseErrorResponse(jqXHR, textStatus, errorThrown);
          this.set('errorMessage', errorMessage);
        }
      });
    },

    cancelPost() {
      this.setProperties({ 
        title: '', 
        content: '', 
        mediaFile: null,
        errorMessage: '',
        isLoading: false
      });
      
      const fileInput = document.getElementById('mediaFile');
      if (fileInput) {
        fileInput.value = '';
      }
      
      this.transitionToRoute('home');
    },

    clearError() {
      this.set('errorMessage', '');
    },
    
    debugAuth() {
      this.get('auth').debugAuthState();
    }
  },
  loadSubreddits() {
    Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/subreddits',
      method: 'GET',
      success: (data) => {
        console.log('Subreddits loaded:', data);
        this.set('subreddits', data);
        if (data.length > 0 && !this.get('subredditId')) {
          this.set('subredditId', data[0].id);
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Failed to load subreddits:');
        console.error('- Status:', jqXHR.status);
        console.error('- Error:', errorThrown);
        console.error('- Response:', jqXHR.responseText);
        
        this.set('errorMessage', 'Failed to load subreddits. Please refresh the page.');
      }
    });
  }
});
