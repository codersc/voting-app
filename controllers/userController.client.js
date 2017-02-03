'use strict';

(function() {
    
    var profileId = document.querySelector('#profile-id') || null;
    var profileUsername = document.querySelector('#profile-username') || null;
    var displayName = document.querySelector('#display-name');
    var apiUrl = appUrl + '/api/:id';
    
    function updateHtmlElement(data, element, userProperty) {
        element.innerHTML = data[userProperty];
    }
    
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/:id', function(data) {
        var userObject = JSON.parse(data);
        
        ajaxFunctions.ajaxRequest('GET', '/api/user/polls', function(response) {
            var polls = JSON.parse(response); 
            var listItems = '';
            
            if (polls.length > 0) {
                for (var i = 0; i < polls.length; i++) {
                    var pollDeletionApiUrl = '/api/poll/' + polls[i]['_id'];
                    
                    listItems += 
                        `<a href="#" class="list-group-item clearfix">${escapeHtml(polls[i]['title'])}` +
                            `<span class="pull-right"><span id="btn-share-${i}" class="btn btn-xs btn-info" data-poll-id=${polls[i]['_id']}>` +
                                `SHARE` +
                                `<span class="glyphicon glyphicon-cloud-upload" aria-hidden="true"></span>` +
                            `</span>` +
                            `&nbsp;` +
                            `<span class="pull-right"><span id="btn-delete-${i}" class="btn btn-xs btn-info" data-api-url=${pollDeletionApiUrl}>` +
                                `DELETE ` +
                                `<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>` +
                            `</span>` +
                        `</a>`;
                        
                    $('#user-poll-list').on('click', `#btn-share-${i}`, function() {
                        var linkToPoll = window.location.origin + '/poll/' + $(this).data('poll-id');
                        
                        $('.user-share-info')
                            .empty()
                            .append(`<div class="well">Tell your friends to go to <strong>${linkToPoll}</strong> so they can see your poll!</div>`);
                    });                   
                        
                    $('#user-poll-list').on('click', `#btn-delete-${i}`, function() {
                        var apiUrl = $(this).data('api-url');
                        
                        ajaxFunctions.ajaxRequest('DELETE', apiUrl, function() {
                            window.location.reload();
                        });
                    });   
                }
            } else {
                $('.container').append("<div class='well'>You haven't created any polls. Go to the home page to make one!</div>");
            }
            
            $('#user-poll-list').append(listItems);
        });
    }));
    
    function escapeHtml(string) {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }    
    
})();