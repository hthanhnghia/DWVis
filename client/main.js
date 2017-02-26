import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.searchBar.onRendered(function() {
  $("#slider").dateRangeSlider({
      bounds:{
        min: new Date(2000, 3, 1),
        max: new Date(2016, 7, 1)
      },

      defaultValues:{
        min: new Date(2000, 3, 1),
        max: new Date(2016, 7, 1)
      },

      step:{
        months: 1,
      },

      formatter:function(val){
        var days = val.getDate(),
            month = val.getMonth() + 1,
            year = val.getFullYear();
        return year + "/" + month;
      }
    });

    // This event will not ne fired
    $("#slider").bind("userValuesChanged", function(e, data){
      	min = data.values.min;
      	max = data.values.max;
      	searchRange(min, max)
    });
});

Template.searchBar.onCreated = function() {
    $("#slider").dateRangeSlider({
      bounds:{
        min: new Date(2000, 3, 1),
        max: new Date(2016, 7, 1)
      },

      defaultValues:{
        min: new Date(2000, 3, 1),
        max: new Date(2016, 7, 1)
      },

      step:{
        months: 1,
      },

      formatter:function(val){
        var days = val.getDate(),
            month = val.getMonth() + 1,
            year = val.getFullYear();
        return year + "/" + month;
      }
    });

    // This event will not ne fired
    $("#slider").bind("userValuesChanged", function(e, data){
      	min = data.values.min;
      	max = data.values.max;
      	searchRange(min, max)
    });
}

Template.searchBar.events({
    'click .btn': function(){
        search();
    }
});