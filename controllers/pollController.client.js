'use strict';

var pollChoices = [];

$(document).ready(function(){
    
    function updateVoteWidget(data) {
        console.log('updateVoteWidget() logged', data);
        
        $('#choices').empty();
        $('#choices').off();
        
        var listItems = `<li class="list-group-item item-emphasis"">${escapeHtml(data.title)}</li>`;
        
        Object.keys(data.choices).map(function(key, index) {
            listItems += 
                `<a href="#" class="list-group-item clearfix">${escapeHtml(key)}` +
                    `<span class="pull-right"><span id="btn-vote-${index}" class="btn btn-xs btn-info">` +
                        `VOTE ` +
                        `<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>` +
                    `</span>` +
                `</a>`;
                
            $('#choices').on('click', `#btn-vote-${index}`, function() {
                ajaxFunctions.ajaxRequest('POST', `api/poll/${data._id}/${key}`, updatePollInfo);
            });
        });
        
        $('#choices').append(listItems);
        
        var textInput = 
            `<label id="label-for-new-choice" for="new-choice">Add a Choice to this Poll:</label>` +
            `<div id="new-choice" class="input-group">` +
                `<input id="input-new-choice" type="text" class="form-control" placeholder="Type your new choice here and click add...">` +
                `<span class="input-group-btn">` +
                    `<button id="btn-add-choice-to-existing-poll" class="btn btn-default btn-info" type="button">Add</button>` +
                `</span>` +
            `</div>` +
            `<div id="new-choice-alert"></div>`;
            
        $('#choices').on('click', '#btn-add-choice-to-existing-poll', function() {
            var choice = $('#input-new-choice').val();
            
            $.ajax(
                { 
                    type: "POST",
                    url: `/api/poll/add/${data['_id']}/${choice}`,
                    success: function(data, textStatus, xhr) {
                        $('#new-choice-alert')
                            .addClass("alert alert-success")
                            .html("Your choice has been added!")
                            .fadeIn("slow")
                            .delay(1500)
                            .fadeOut("slow");             
                        
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);  
                    },
                    error: function() {
                        $('#new-choice-alert')
                            .removeClass()
                            .addClass("alert alert-danger")
                            .html("Login to add your choice to the poll!")
                            .fadeIn("slow")
                            .delay(1500)
                            .fadeOut("slow");             
                    }
                }
            );            
            
            ajaxFunctions.ajaxRequest('POST', `/api/poll/add/${data['_id']}/${choice}`, function(res) {
                console.log(res);
                
                $('#new-choice-alert')
                    .addClass("alert alert-success")
                    .html("Your choice has been added!")
                    .fadeIn("slow")
                    .delay(1500)
                    .fadeOut("slow");             
                
                setTimeout(function() {
                    window.location.reload();
                }, 1500);  
            });
        });
                
        $('#choices').append(textInput);
    } 
    
    function displayChart(data, totalVotes) {
        console.log('displayChart(data) logged', data);
        
        var percentagePerVote = 100 / totalVotes;

        data = data.filter(function(choice) {
            return choice.votes > 0; 
        });
        
        var pie = d3.layout.pie()
            .value(function(d) { return d.votes })
            .sort(null)
            .padAngle(.03);
        
        var w = 300;
        var h = 300;
        
        var outerRadius = w / 2;
        var innerRadius = 100;
        
        var color = d3.scale.category10();
        
        var arc = d3.svg.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);
        
        var svg = d3.select(".poll-chart")
            .append("svg")
            .attr({
                width: w,
                height: h,
                class:'shadow'
            }).append('g')
            .attr({
                transform:'translate(' + w / 2 + ', ' + h / 2 + ')'
            });
            
        var path = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr({
                d: arc,
                fill: function(d, i) {
                    return color(d.data.choice);
                }
            });
        
        path.transition()
            .duration(1000)
            .attrTween('d', function(d) {
                var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                
                return function(t) {
                    return arc(interpolate(t));
                };
            });
        
        
        var restOfTheData = function() {
            var text = svg.selectAll('text')
                    .data(pie(data))
                    .enter()
                    .append("text")
                    .transition()
                    .duration(200)
                    .attr("transform", function(d) {
                        return "translate(" + arc.centroid(d) + ")";
                    })
                    .attr("dy", ".4em")
                    .attr("text-anchor", "middle")
                    .text(function(d){
                        return d.data.votes;
                    })
                    .style({
                        fill:'#fff',
                        'font-size': '10px'
                    });
            
            var legendRectSize = 20;
            var legendSpacing = 7;
            var legendHeight = legendRectSize + legendSpacing;
        
        
            var legend = svg.selectAll('.legend')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    .attr({
                        class: 'legend',
                        transform: function(d, i) {
                            //Just a calculation for x & y position
                            return 'translate(-35,' + ((i * legendHeight) - 65) + ')';
                        }
                    });
                    
            legend.append('rect')
                    .attr({
                        width: legendRectSize,
                        height: legendRectSize,
                        rx: 20,
                        ry: 20
                    })
                    .style({
                        fill:color,
                        stroke:color
                    });
        
            legend.append('text')
                    .attr({
                        x: 30,
                        y: 15
                    })
                    .text(function(d) {
                        return d;
                    }).style({
                        fill:'#929DAF',
                        'font-size':'14px'
                    });
        };
        
         setTimeout(restOfTheData,1000);
    }
    
    function updatePollInfo(data) {
        console.log('updatePollInfo(data) logged', data);
        
        console.log('typeof data', typeof JSON.parse(data));

        data = JSON.parse(data);
        
        // format data for D3
        var formattedData = [];
        
        Object.keys(data.choices).map(function(key, index) {
            formattedData.push(
                { 
                    choice: key, 
                    votes: data['choices'][key] 
                }
            );
        });
        
        setTimeout(function() { window.scrollTo(0, 100); }, 100);
        
        $('svg').remove();
        
        var totalVotes = 0;
        
        for(var i = 0; i < formattedData.length; i++) {
            formattedData[i].votes = parseInt(formattedData[i].votes);
            totalVotes += formattedData[i].votes;
        }
        
        // only for testing
        // totalVotes = 1;
        
        if(totalVotes > 0) {
            displayChart(formattedData, totalVotes);
            
            updateVoteWidget(data);
        } else {
            
            updateVoteWidget(data);
        }
    }
    
    function updatePolls(data) {
        var polls = JSON.parse(data);
        
        for (var i = 0; i < polls.length; i++) {
            var apiUrl = '/api/poll/' + polls[i]['_id'];
            var listItem = "<button type='button' class='list-group-item' data-api-url='" + apiUrl + "' id='poll-item-" + i + "'>" + escapeHtml(polls[i]['title']) + "</button>";
            
            $('#poll-list').on('click', '#poll-item-' + i, function() {
                var apiUrl = $(this).data('api-url')
                ajaxFunctions.ajaxRequest('GET', apiUrl, updatePollInfo);
            });    
            
            $('#poll-list').append(listItem);
        }
    }
    
    ajaxFunctions.ajaxRequest('GET', '/api/polls', updatePolls);
    
    $('#btn-add-choice').click(function() {
        var pollTitle = $('#input-title').val();
        var pollChoice = $('#input-choice').val();
        
        for (var i = 0; i < pollChoices.length; i++) {
            if (pollChoices[i] == pollChoice) {
                $('.alert')
                    .html("<strong>Oh snap!</strong> You already added that option.")
                    .fadeIn("slow")
                    .delay(1500)
                    .fadeOut("slow");
                    
                return;
            }
        }
        
        pollChoices.push(pollChoice);        
        
        $('.panel-heading').text(pollTitle);
        
        $('.table-body')
            .append(
                $("<tr><td>" + pollChoice + "</td><td><button class='btn btn-default btn-primary btn-edit-choice pull-right' value='" + pollChoice + "'>Remove</button></td></tr>")
                    .hide()
                    .fadeIn("slow")
            );
        
        if (!$('.new-poll').is(":visible")) {
            $('.new-poll').fadeIn("slow");
        }
        
        $('form')
            .append("<input type='hidden' name='choices[]' value='" + pollChoice + "'>");
    });
    
    $('.table-body').on("click", ".btn-edit-choice", function(e) {
        var pollChoice = e.target.value;
        var indxToRemove = pollChoices.indexOf(pollChoice);
        
        pollChoices.splice(indxToRemove, 1);
       
        var tr = $("td").filter(function() {
            return $(this).text() === pollChoice;
        }).closest("tr");
        
        tr.fadeOut("slow", function() { 
            pollChoices.filter(function(val) { 
                return val !== pollChoice; 
            });
            
            $(this).remove(); 
        });
    });
    
});

function submitForm(e) {
    if ($('#input-title').val() === '') {
        $('.alert')
            .html("You should add at a <strong>title</strong>.")
            .fadeIn("slow")
            .delay(1500)
            .fadeOut("slow");   
            
        return false;
    }
    
    if (pollChoices.length < 2) {
        $('.alert')
            .html("You should add at least <strong>two</strong> choices to vote on.")
            .fadeIn("slow")
            .delay(1500)
            .fadeOut("slow");  
        
        return false;
    }
    
    $.ajax(
        { 
            type: "POST",
            url: '/api/polls',
            data: $('#poll-form').serializeArray(),
            success: function(data, textStatus, xhr) {
                console.log(xhr.status);
                
                $('.alert')
                    .removeClass()
                    .addClass("alert alert-success")
                    .html("Your poll has been created!")
                    .fadeIn("slow")
                    .delay(1500)
                    .fadeOut("slow");
                    
                setTimeout(function() {
                    window.location.reload();
                }, 1500);
            },
            error: function() {
                $('.alert')
                    .removeClass()
                    .addClass("alert alert-danger")
                    .html("Login to create your poll!")
                    .fadeIn("slow")
                    .delay(1500)
                    .fadeOut("slow");                 
            }
        }
    );
    
    return false;
}

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