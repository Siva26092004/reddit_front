
/* global Ember */
export default Ember.Controller.extend({
  username: '',
  password: '',
  actions: {
    register() {
      const { username, password } = this.getProperties('username', 'password');
      Ember.$.ajax({
        url: 'http://localhost:8080/reddit_server/api/register',
        method:'POST',
        contentType:'application/json',
        data: JSON.stringify({ username, password }),
        xhrFields: {
          withCredentials: true 
        },
        success: () => {
          alert('Registered successfully!');
          console.log(username,password);
          this.transitionToRoute('login');
        },
        error: (err) => {
          console.error("Registration error:", err.responseText);
        }
      });
    }
  }
});
