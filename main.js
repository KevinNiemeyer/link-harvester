/*
  Link Harvester -  
  Harvests external links and email addresses from text
*/

(function ($) {
  'use strict';

  var fileInput = $('#files');
  var uploadButton = $('#upload');
  var clearButton = $('#clearButton');
  var markupText = $('#markupText');
  var harvestButton = $('#harvestButton');
  var chooseFileButton = $('.chooseFileButton');
  var results = $('#result');

  // for some reason, these won't work unless you use addEventListener
  var tmpInput = document.getElementById('files');
  var tmpTxt = document.getElementById('custom-text');

  uploadButton.hide();
  clearButton.attr('disabled', true);
  harvestButton.attr('disabled', true);
  clearButton.css('cursor', 'not-allowed');
  harvestButton.css('cursor', 'not-allowed');

  // code to make label's text match input button's text
  tmpInput.addEventListener('change', function () {
    if (tmpInput.value) {
      // get the name of the file minus the path
      tmpTxt.innerHTML = tmpInput.files[0].name;
    } else {
      tmpTxt.innerHTML = 'No file chosen.';
    }
  });

  harvestButton.on('click', function () {
    var testString = markupText.val();
    results.empty();
    var retObj = {};
    // load links into object
    retObj['links'] = harvest(testString, 'links');
    // load email addresses into object
    retObj['emailAddresses'] = harvest(testString, 'emails');

    if (retObj['links'].length > 0 || retObj['emailAddresses'].length > 0) {
      $('#result').append(`<div class="header"><h1>Results:</h1></div>`);
    } else {
      $('#result').append(
        `<div class="header"><h1>No links or email addresses available.</h1></div>`
      );
    }

    for (var key1 in retObj) {
      if (key1 === 'emailAddresses') {
        var header = $('<div style="margin: 20px;""><ol>').html(
          '<h2>Email Addresses:</h2>'
        );
        for (var i = 0; i < retObj[key1].length; i++) {
          var link = $('<li style="list-style-type: none;">').html(
            `${i + 1}: ${retObj[key1][i]}`
          );
          header.append(link);
          $('#result').append(header);
        }
      } else if (key1 === 'links') {
        var header = $('<div style="margin: 20px;"><ol>').html(
          '<h2>Links:</h2>'
        );
        for (var i = 0; i < retObj['links'].length; i++) {
          var header2 = $('<li style="list-style-type: none;">').html(
            `${i + 1}: ${retObj['links'][i]['linkText']}: ${
              retObj['links'][i]['url']
            }`
          );
          var link = $('<li>').html(retObj['links'][i]['url']);
          header.append(header2);

          $('#result').append(header);
        }
      }
    }
  });

  //****************************************************************
  function harvest(textBlock, type) {
    // type can be links or emails
    // returns an object containing an array of objects

    if (type === 'links') {
      return harvestUrl(textBlock);
    } else if (type === 'emails') {
      return harvestEmails(textBlock);
    }
  }

  //****************************************************************
  function harvestEmails(textBlock) {
    // pattern to parse email addresses
    // mailto:magna@aliqua.com
    let emailsPattern = /mailto:([a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,5})/gi,
      emailsArray = [],
      execArray = [];

    while (execArray != null) {
      // filter the emails from the textBlock using exec, then store the
      // email, which is element 1 into an array.
      execArray = emailsPattern.exec(textBlock);
      if (execArray != null) {
        emailsArray.push(execArray[1]);
      }
    }
    return emailsArray;
  }

  //****************************************************************
  function harvestUrl(textBlock) {
    //pattern to parse links
    //<a href="https://exampleurl2.com">aliquip</a>
    let linksPattern = /<a[^>]+href=["'](https?:\/\/.*?)["']>([\w ]+)/gi,
      linksArray = [],
      execArray = [],
      objArray = [];

    while (execArray != null) {
      // filter the links and text
      // create an exec array for each pattern, then store the link
      // and its text (elements 1 and 2 of execArray)
      // in an object of links and text
      execArray = linksPattern.exec(textBlock);

      // creates a single array with //one pattern match;
      // starts at next pattern match on each iteration of the while loop.

      if (execArray != null) {
        // create a new object for each link/text pair and store it in
        // an array of objects
        var linkObj = {};
        linkObj['linkText'] = execArray[2];
        linkObj['url'] = execArray[1];
        objArray.push(linkObj);
      }
    }
    return objArray;
  }

  clearButton.on('click', function () {
    markupText.val('');
    results.empty();
    uploadButton.hide();
    uploadButton.css('cursor', 'not-allowed');
    harvestButton.attr('disabled', true);
    harvestButton.css('cursor', 'not-allowed');
    clearButton.attr('disabled', true);
    clearButton.css('cursor', 'not-allowed');
    fileInput.val('');
    tmpTxt.innerHTML = 'No file chosen.';
  });

  // upload functions
  //****************************************************************

  chooseFileButton.change(function () {
    if (document.getElementById('files').files.length > 0) {
      uploadButton.show();
      uploadButton.css('cursor', 'default');
    } else {
      uploadButton.hide();
    }
  });

  uploadButton.on('click', function () {
    if (!window.FileReader) {
      alert('Your browser is not supported');
      return false;
    }
    var input = fileInput.get(0);

    // Create a reader object
    var reader = new FileReader();
    if (input.files.length > 0) {
      var textFile = input.files[0];
      // Read the file
      reader.readAsText(textFile);
      // When it's loaded, process it
      $(reader).on('load', processFile);
      harvestButton.attr('disabled', false);
      harvestButton.css('cursor', 'default');
      clearButton.attr('disabled', false);
      clearButton.css('cursor', 'default');
    } else {
      alert('Please upload a file before continuing');
    }
  });

  function processFile(e) {
    var file = e.target.result,
      results;
    if (file && file.length) {
      results = file.split('\n');
      markupText.val(results);
      uploadButton.hide();
    }
  }

  markupText.on('input', function (e) {
    $(':file').css('color', 'lightgrey');
    if (document.getElementById('files').files.length > 0) {
      uploadButton.show();
    } else {
      uploadButton.hide();
    }

    harvestButton.attr('disabled', false);
    harvestButton.css('cursor', 'default');
    clearButton.attr('disabled', false);
    clearButton.css('cursor', 'default');
    return false; // Prevent the default handler from running.
  });
})(jQuery);
