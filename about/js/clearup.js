// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This class wraps the popup's form, and performs the proper clearing of data
 * based on the user's selections. It depends on the form containing a single
 * select element with an id of 'timeframe', and a single button with an id of
 * 'button'. When you write actual code you should probably be a little more
 * accepting of variance, but this is just a sample app. :)
 *
 * Most of this is boilerplate binding the controller to the UI. The bits that
 * specifically will be useful when using the BrowsingData API are contained in
 * `parseMilliseconds_`, `handleCallback_`, and `handleClick_`.
 *
 * @constructor
 */
var PopupController = function () {
  this.button_ = document.getElementById('button');
  this.buttonSearch = document.getElementById('historyBtn');
  this.deleteChecked = document.getElementById('deleteChecked');
  this.deleteAll = document.getElementById('deleteAll');
  this.timeframe_ = document.getElementById('timeframe');
  this.addListeners_();
};

PopupController.prototype = {
  /**
   * A cached reference to the button element.
   *
   * @type {Element}
   * @private
   */
  button_: null,

  opt_arr: ["appcache","cache","cookies","downloads","fileSystems","formData","history","indexedDB","localStorage","serverBoundCertificates","pluginData","passwords","webSQL"],

  /**
   * A cached reference to the select element.
   *
   * @type {Element}
   * @private
   */
  timeframe_: null,

  /**
   * Adds event listeners to the button in order to capture a user's click, and
   * perform some action in response.
   *
   * @private
   */
  addListeners_: function () {
    this.button_.addEventListener('click', this.handleClick_.bind(this));
    this.buttonSearch.addEventListener('click', this.handleHistory.bind(this));
    this.buttonSearch.click();

      document.getElementById('searchHistory').onkeyup = function(e){
          if (!e) e = window.event;
          var keyCode = e.keyCode || e.which;
          console.log("keyCode", keyCode);
//          if (keyCode == '13'){
          PopupController.prototype.handleHistory();
          if (keyCode == '13')
              return false;
//          }
      }
  },
  /**
   * Given a string, return milliseconds since epoch. If the string isn't
   * valid, returns undefined.
   *
   * @param {string} timeframe One of 'hour', 'day', 'week', '4weeks', or
   *     'forever'.
   * @returns {number} Milliseconds since epoch.
   * @private
   */
  parseMilliseconds_: function (timeframe) {
    var now = new Date().getTime();
    var milliseconds = {
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      '4weeks': 4 * 7 * 24 * 60 * 60 * 1000
    };

    if (milliseconds[timeframe])
      return now - milliseconds[timeframe];

    if (timeframe === 'forever')
      return 0;

    return null;
  },

  /**
   * Handle a success/failure callback from the `browsingData` API methods,
   * updating the UI appropriately.
   *
   * @private
   */
  handleCallback_: function () {
    /*var success = document.createElement('div');
    success.classList.add('overlay');
    success.setAttribute('role', 'alert');
    success.textContent = 'Data has been cleared.';
    document.body.appendChild(success); */

    var this_button_ = this.button_;

    setTimeout(function() {
       this_button_.innerText = 'Completed!';
    }, 2000);
    if(document.getElementById('foundBlock').innerHTML !== "") {
        this.handleHistory();
    }

    /*setTimeout(function() {
       this_button_.setAttribute('disabled', false);
       this_button_.innerText = 'Clean Now!';
    }, 5000);*/

    /*setTimeout(function() { success.classList.add('visible'); }, 10);
    setTimeout(function() {
      if (close === false)
        success.classList.remove('visible');
      else
        window.close();
    }, 4000);  */
  },

  handleClick_: function () {
    var removal_start = this.parseMilliseconds_(this.timeframe_.value);
    if (removal_start !== undefined) {
      this.button_.setAttribute('disabled', 'disabled');
      this.button_.innerText = 'Clearing...';

      var data = {};
      for (var i = 0; i < this.opt_arr.length; i++) {
        data[this.opt_arr[i]]= true;
      }

      chrome.browsingData.remove({ "since" : removal_start },
        data,
        this.handleCallback_.bind(this));
    }
  },
  handleHistory: function () {
    var searchText = document.getElementById("searchHistory").value ? document.getElementById("searchHistory").value : '';

    console.log("searchText: ", document.getElementById("searchHistory").value);

        chrome.history.search({'text':searchText, 'maxResults':0}, function(historyItems){
            var found = '<div class="found">';
            found += '<span class="found-count">Found:'+historyItems.length+'</span>'+(historyItems.length > 0 ? '<a href="javascript:void(0)" class="selectall">Select all</a>' : '')+'</div><div class="found-result '+(historyItems.length > 0 ? 'show' : '')+'"><table id="optionData">';
            for (var i = 0; i < historyItems.length; i++) {
                var title = historyItems[i].title ? historyItems[i].title : historyItems[i].url;
                found += '<tr><td><label><input type="checkbox" id="'+historyItems[i].id+'" data-url="'+historyItems[i].url+'"><span class="title" title="'+title+'">'+title+'</span></label></td></tr>';
            }
            found += '</table></div>';
            found += '<div class="action"><button class="btn-default" id="deleteChecked">Delete</button><button class="btn-default" id="deleteAll">Delete all history</button></div>';
            document.getElementById('foundBlock').innerHTML = found;

        });

    }
};

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController();
});

//function select_button(kind){
$(document).on('click', '.selectall', function(){
    var parent = $('#optionData');
    $(this).toggleClass('check').text($(this).hasClass('check') ? 'Uncheck all': 'Select all');
    var checked = $(this).hasClass('check') ? true : false;

    parent.find('input').prop('checked', checked);

}).off('click', '.titleHeader .toggle').on('click', '.titleHeader .toggle', function(){
    var that = $(this),
        toggle = $(this).attr('toggle'),
        toggleBlock = $(toggle);

    if (that.hasClass('show')) {
        toggleBlock.slideUp("slow", function() {
            $(this).removeClass('show');
            that.removeClass('show');
        });
    } else {
        $('.main-section .block.show').slideUp("slow", function() {
            $(this).removeClass('show')
            $(this).prev('.titleHeader').find('.toggle.show').removeClass('show')
        });

        toggleBlock.addClass('show');
        that.addClass('show');
        toggleBlock.slideDown("slow", function() {});
    }
}).off('click', 'a.advanced').on('click', 'a.advanced', function(){
    var that = $(this),
        toggleBlock = $('.advanced-block');

    if (toggleBlock.is(':visible')) {
       toggleBlock.slideUp("slow");
       that.removeClass('show');
    } else {
       toggleBlock.slideDown("slow", function(){
           document.body.scrollTop = $('#aboutcleanup_title').offset().top;
       });
       that.addClass('show');
    }
}).off('click', '#deleteChecked').on('click', '#deleteChecked', function(){
    deleteUrl(true);
}).off('click', '#deleteAll').on('click', '#deleteAll', function () {

  if (confirm("Are you sure you want to remove all history?(cannot be undone)")) {
    deleteUrl(false);
  }
});
function deleteUrl(attr) {
    if(attr) {
        var inputs = $('#optionData').find('input:checked');
    } else {
        var inputs = $('#optionData').find('input');
    }

    for(var i = 0; i < inputs.length; i++) {
        var url = $(inputs[i]).data("url");
        chrome.history.deleteUrl({
            url: url
        }, function(){
            if(attr) {
                PopupController.prototype.handleHistory();
            } else {
                document.getElementById('foundBlock').innerHTML = '';
                document.getElementById("searchHistory").value = '';
            }

        });
    }

}