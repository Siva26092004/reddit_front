import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('register');
 this.route('home');
  this.route('create-subreddits');
  this.route('create-post');
  this.route('post', { path: '/posts/:post_id' });
   this.route('subreddit', { path: '/r/:subreddit_id' });
});

export default Router;
