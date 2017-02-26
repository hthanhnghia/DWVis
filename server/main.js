import { Meteor } from 'meteor/meteor';

var userCollection = new Mongo.Collection('users');
var nodeCollection = new Mongo.Collection('nodes');
var linkCollection = new Mongo.Collection('links');

Meteor.startup(() => {
  	// code to run on server at startup
  	Meteor.publish('users', function () {
    	return userCollection.find();
	});

	Meteor.publish('nodes', function () {
    	return userCollection.find();
	});

	Meteor.publish('links', function () {
    	return userCollection.find();
	});
});
