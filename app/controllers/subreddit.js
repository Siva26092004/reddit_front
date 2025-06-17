/* global Ember */
export default Ember.Controller.extend({
  userId: 1,

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
        alert(`Failed to vote: ${errorMessage}`);
      }
    });
  },

  actions: {
    createPost() {
      // Navigate to create-post with subreddit context
      this.transitionToRoute('create-post', {
        queryParams: { subreddit_id: this.get('model.subreddit.id') }
      });
    },

    openPost(postId) {
      this.transitionToRoute('post', postId);
    },

    upvotePost(postId) {
      this.sendVote(postId, 'post', 1);
    },

    downvotePost(postId) {
      this.sendVote(postId, 'post', -1);
    },

    refreshModel() {
      this.get('target').send('refreshModel');
    },

    goBack() {
      this.transitionToRoute('home');
    }
  }
});
