/* global Ember */
export default Ember.Controller.extend({
  auth: Ember.inject.service(),
  
 
  commentContent: '',
  replyContent: '',
  showingReplyFormFor: null,

  // Helper equality checks
  eq: Ember.computed(function() {
    return (a, b) => a === b;
  }),

  // Improved error response parser
  parseErrorResponse(jqXHR, textStatus, errorThrown) {
    let errorMessage = 'Unknown error';
    
    console.log('DEBUG - Error Response Details:');
    console.log('  Status:', jqXHR.status);
    console.log('  Status Text:', jqXHR.statusText);
    console.log('  Response Text:', jqXHR.responseText);
    console.log('  Content Type:', jqXHR.getResponseHeader('Content-Type'));
    
    try {
      // Check if response is empty
      if (!jqXHR.responseText || jqXHR.responseText.trim() === '') {
        errorMessage = `Server returned empty response (Status: ${jqXHR.status})`;
        return errorMessage;
      }
      
      // Try to parse JSON
      const errorResponse = JSON.parse(jqXHR.responseText);
      errorMessage = errorResponse.error || errorResponse.message || errorMessage;
      
    } catch (parseError) {
      console.error('Failed to parse error response as JSON:', parseError);
      
      // Handle different status codes
      switch (jqXHR.status) {
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 404:
          errorMessage = 'Resource not found. Please refresh the page.';
          break;
        case 403:
          errorMessage = 'Access denied. Please log in again.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        default:
          errorMessage = `Server error (${jqXHR.status}): ${jqXHR.responseText || errorThrown || textStatus}`;
      }
    }
    
    return errorMessage;
  },

  // Helper function to send vote requests to the backend
  sendVote(targetId, targetType, voteType) {
    // Check if user is authenticated
    if (!this.get('auth.isAuthenticated')) {
      alert('Please log in to vote.');
      this.transitionToRoute('login');
      return;
    }

    const currentUserId = this.get('auth').getCurrentUserId();
    
    if (!currentUserId) {
      console.error('User ID not found in auth service');
      alert('Authentication error. Please log in again.');
      this.transitionToRoute('login');
      return;
    }

    const payload = {
      userId: currentUserId,
      targetId: targetId,
      targetType: targetType, // 'post' or 'comment'
      voteType: voteType // 1: upvote, -1: downvote
    };

    console.log('Sending vote:', payload);

    Ember.$.ajax({
      url: 'http://localhost:8080/reddit_server/api/votes',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: (response) => {
        console.log(`Vote on ${targetType} ${targetId} successful:`, response);
        this.send('refreshModel'); // Refresh the model to update vote counts on the UI
      },
      error: (jqXHR, textStatus, errorThrown) => {
        const errorMessage = this.parseErrorResponse(jqXHR, textStatus, errorThrown);
        console.error(`Failed to vote on ${targetType} ${targetId}:`, errorMessage);
        alert(`Failed to vote: ${errorMessage}`);
      }
    });
  },

  actions: {
   
    addComment() {
      // Check if user is authenticated
      if (!this.get('auth.isAuthenticated')) {
        alert('Please log in to comment.');
        this.transitionToRoute('login');
        return;
      }

      const postId = this.get('post.id');
      const userId = this.get('auth').getCurrentUserId();
      const content = this.get('commentContent');

      // DEBUG: Log the values being retrieved
      console.log('DEBUG - addComment values:');
      console.log('  postId:', postId, '(type:', typeof postId, ')');
      console.log('  userId:', userId, '(type:', typeof userId, ')');
      console.log('  content:', content, '(type:', typeof content, ')');
      console.log('  post object:', this.get('post'));

      if (!postId) {
        alert('Error: Post ID is missing. Please refresh the page and try again.');
        return;
      }

      if (!userId) {
        alert('Authentication error. Please log in again.');
        this.transitionToRoute('login');
        return;
      }

      if (!content || content.trim() === '') {
        alert('Please enter your comment.');
        return;
      }

      const payload = {
        postId: parseInt(postId),
        userId: parseInt(userId),
        content: content.trim()
        
      };

      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/comments',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: (response, textStatus, jqXHR) => {
          console.log('DEBUG - Success Response Details:');
          console.log('  Status:', jqXHR.status);
          console.log('  Response:', response);
          console.log('  Response Type:', typeof response);
          console.log('  Content Type:', jqXHR.getResponseHeader('Content-Type'));
          
          console.log('Comment added successfully:', response);
          this.set('commentContent', ''); // Clear the comment input field
          this.send('refreshModel'); // Tell the route to re-fetch its model (post and comments)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.log('DEBUG - AJAX Error Details:');
          console.log('  jqXHR:', jqXHR);
          console.log('  textStatus:', textStatus);
          console.log('  errorThrown:', errorThrown);
          
          const errorMessage = this.parseErrorResponse(jqXHR, textStatus, errorThrown);
          console.error('Failed to add comment:', errorMessage);
          console.error('DEBUG - Request payload was:', JSON.stringify(payload, null, 2));
          alert(`Failed to add comment: ${errorMessage}`);
        }
      });
    },

    // Action to add a reply to an existing comment (nested comment)
    addReply(parentCommentId) {
      // Check if user is authenticated
      if (!this.get('auth.isAuthenticated')) {
        alert('Please log in to reply.');
        this.transitionToRoute('login');
        return;
      }

      const postId = this.get('post.id');
      const userId = this.get('auth').getCurrentUserId();
      const content = this.get('replyContent');

      // DEBUG: Log the values being retrieved
      console.log('DEBUG - addReply values:');
      console.log('  postId:', postId, '(type:', typeof postId, ')');
      console.log('  userId:', userId, '(type:', typeof userId, ')');
      console.log('  content:', content, '(type:', typeof content, ')');
      console.log('  parentCommentId:', parentCommentId, '(type:', typeof parentCommentId, ')');

      if (!postId) {
        alert('Error: Post ID is missing. Please refresh the page and try again.');
        return;
      }

      if (!userId) {
        alert('Authentication error. Please log in again.');
        this.transitionToRoute('login');
        return;
      }

      if (!content || content.trim() === '') {
        alert('Please enter your reply.');
        return;
      }

      const payload = {
        postId: parseInt(postId),
        userId: parseInt(userId),
        content: content.trim(),
        parentCommentId: parseInt(parentCommentId)
      };

      console.log('DEBUG - Reply payload being sent:', JSON.stringify(payload, null, 2));

      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/comments',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: (response, textStatus, jqXHR) => {
          console.log('DEBUG - Reply Success Response Details:');
          console.log('  Status:', jqXHR.status);
          console.log('  Response:', response);
          console.log('  Content Type:', jqXHR.getResponseHeader('Content-Type'));
          
          console.log('Reply added successfully:', response);
          this.set('replyContent', '');
          this.set('showingReplyFormFor', null);
          this.send('refreshModel'); // Tell the route to re-fetch its model (post and comments)
        },
        error: (jqXHR, textStatus, errorThrown) => {
          const errorMessage = this.parseErrorResponse(jqXHR, textStatus, errorThrown);
          console.error('Failed to add reply:', errorMessage);
          console.error('DEBUG - Request payload was:', JSON.stringify(payload, null, 2));
          alert(`Failed to add reply: ${errorMessage}`);
        }
      });
    },

    toggleReplyForm(commentId) {
      if (!this.get('auth.isAuthenticated')) {
        alert('Please log in to reply.');
        this.transitionToRoute('login');
        return;
      }

      if (this.get('showingReplyFormFor') === commentId) {
        this.set('showingReplyFormFor', null); // If already open for this comment, close it
      } else {
        this.set('showingReplyFormFor', commentId); // Open for this comment
        this.set('replyContent', ''); // Clear reply content when opening a new form
      }
    },

    // Action to explicitly cancel and hide the reply form
    cancelReply() {
      this.set('showingReplyFormFor', null);
      this.set('replyContent', '');
    },

    // Action to handle upvoting a target (post or comment/reply)
    upvoteTarget(targetId, targetType) {
      this.sendVote(targetId, targetType, 1);
    },

    // Action to handle downvoting a target (post or comment/reply)
    downvoteTarget(targetId, targetType) {
      this.sendVote(targetId, targetType, -1);
    },

    // Action passed from the route to trigger a model refresh
    refreshModel: function() {
      this.get('target').send('refreshModel'); // Sends 'refreshModel' action up to the route
    }
  }
});
