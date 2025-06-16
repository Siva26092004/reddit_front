/* global Ember */
export default Ember.Controller.extend({
  subreddits: [],
  selectedSubreddit: null,
  userId: 1, 
  init() {
    this._super(...arguments);
    this.loadSubreddits();
  },
  sendVote(targetId, targetType, voteType) {
    const currentUserId = this.get('userId'); 
    if (!currentUserId) {
      console.error('User not logged in. Cannot vote.');
      alert('Please log in to vote.'); 
      return;
    }
    const payload = {
      userId: currentUserId,
      targetId: targetId,
      targetType: targetType, // 'post' or 'comment'
      voteType: voteType      // 1: upvote, -1: downvote, 0: remove
    };

    Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/votes',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: (response) => {
        console.log(`Vote on ${targetType} ${targetId} successful:`, response);
        this.send('refreshModel');
      },
      error: (jqXHR, textStatus, errorThrown) => {
        const errorMessage = jqXHR.responseText ? JSON.parse(jqXHR.responseText).error : errorThrown || 'Unknown error';
        console.error(`Failed to vote on ${targetType} ${targetId}:`, errorMessage);
        alert(`Failed to vote: ${errorMessage}`); // Use custom modal in real app
      }
    });
  },

  loadSubreddits() {
    Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/subreddits',
      method: 'GET',
      success: (data) => {
        this.set('subreddits', data);
        if (data.length > 0 && !this.get('subredditId')) {
            this.set('subredditId', data[0].id);
        }
      },
      error: (err) => {
        console.error('Failed to load subreddits:', err);
      }
    });
  },

  actions: {
    selectSubreddit(subredditId) {
      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/subreddits?id=' + subredditId,
        method: 'GET',
        success: (data) => {
          this.set('selectedSubreddit', data);
        },
        error: (err) => {
          console.error('Failed to load selected subreddit:', err);
          this.set('selectedSubreddit', null);
        }
      });
    },

    goToCreatePost() {
      this.transitionToRoute('create-post');
    },

    goToCreateSubreddit() {
      this.transitionToRoute('subreddits');
    },
    upvotePost(postId) {
      this.sendVote(postId, 'post', 1);
    },
    downvotePost(postId) {
      this.sendVote(postId, 'post', -1);
    },

    refreshModel(){
      this.get('target').send('refreshModel');
    },
    openPost(postId){
      this.transitionToRoute('post', { id: postId });
    }
  }
});
