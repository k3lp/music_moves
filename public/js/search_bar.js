var removeResults = function (evt) {
    if (!evt.target.classList.contains('list-group-item')) {
        evt.preventDefault();
        evt.stopPropagation();

        $('#search-results .list-group-item')
        .slideUp(500);

        document.removeEventListener('click', removeResults, true);
    }
};

var SearchBar = function (options) {
    this.searchTypes = {
        ARTIST: 0,
        SONG: 1
    };
    
    this.currentSong = null;
    this.currentArtist = null;
    
    this.options = $.extend({
        selectedQueryType: this.searchTypes.ARTIST,
        queryTypes: [{
            name: 'Artist',
            url: 'api/streamwatch/artist'
        },{
            name: 'Song',
            url: 'api/streamwatch/song'
        }],
        onSubmit: function (evt) { console.log('onSubmit', evt); },
        onFilterUpdate: function (evt) { console.log('onFilterUpdate', evt); }
    }, options);
    
    $('#filter-button').html(this.options.queryTypes[this.options.selectedQueryType].name + ' <span class="caret"></span>');
    
    $('#search-bar').focus(function () { $(this).val(''); });
    
    $('#search-submit').click(this.submit.bind(this));
        
    $('#search-results').on('click', '.list-group-item', this.selectItem.bind(this));
    
    $('#search-form').submit(function (evt) {
        this.submit()
        evt.preventDefault();
    }.bind(this));
    
    $(document).on('click', '.filter-option', this.updateFilter.bind(this));
    
    this.buildDropDown();
}

SearchBar.prototype.buildDropDown = function () {
    $('#filter-dropdown').empty();

    for (var i = 0; i < this.options.queryTypes.length; i++) {
        if(i != this.options.selectedQueryType) {
            $('<li><a id="query-' + i + '" class="filter-option" href="#">' + this.options.queryTypes[i].name + '</a></li>')
            .appendTo('#filter-dropdown');
        }
    }
}

SearchBar.prototype.updateFilter = function (evt) {
    var url;
    
    this.options.selectedQueryType = parseInt(evt.target.id.split('-')[1]);
    $('#filter-button').html(this.options.queryTypes[this.options.selectedQueryType].name + ' <span class="caret"></span>');
    
    this.options.onFilterUpdate(evt);
    /*showLoader();
    
    if (this.options.selectedQueryType === this.searchTypes.SONG) {
        url = 'api/streamwatch/song/country';
    } else {
        url = 'api/streamwatch/artist/country';
    }
    
    var promise = new Promise(function(resolve, reject) {
        d3.json(url, function(err, data) {
            (err) ? reject(err) : resolve(data);
        });
    }).then(function (data) {
        //map.reset();
        
        setTimeout(function () {
            map.setData(data);
        
            hideLoader();
        
            map.drawLines();
        }, 1000)
        
        setTimeout(map.update.bind(map), 1000)
        setTimeout(map.hideLines.bind(map), 2000)
    });*/
    
    this.buildDropDown();
}

SearchBar.prototype.selectItem = function (evt) {
    var url,
        id = evt.target.id,
        resultDiv = $('#search-results');
    
    resultDiv.empty();
    
    $('#search-submit')
        .addClass('btn-danger')
        .removeClass('btn-primary')
        .html('Remove');
        
    $('#search-bar')
        .val(evt.target.textContent)
        .attr('disabled', 'disabled');

    $('#filter-button').attr('disabled', 'disabled');
    
    document.removeEventListener('click', removeResults, true);
    
    if (this.options.selectedQueryType === this.searchTypes.SONG) {
        this.currentArtist = id.split('_')[0];
        this.currentSong = id.split('_')[1];
    } else {
        this.currentArtist = id;
    }
    
    this.options.onSubmit(evt);
    
    /*showLoader();
        
    if (this.options.selectedQueryType === this.searchTypes.SONG) {
        url = 'api/streamwatch/song/country?song=' + encodeURI(id);
        this.currentSong = id;
    } else {
        url = 'api/streamwatch/artist/country?mbId=' + encodeURI(id) ;
        this.currentArtist = id;
    }
    
    if (url) {
        var promise = new Promise(function(resolve, reject) {
            d3.json(url, function(err, data) {
                (err) ? reject(err) : resolve(data);
            });
        }).then(function (data) {
            map.setData(data);
            
            hideLoader();
            
            map.update();

            $('#plan-tour-button').prop('disabled', false);
        });
    }*/
}

SearchBar.prototype.showSongs = function (data) {
    var i;

    for (i = 0; i < data.length; i++) {
        $('<button id="' + data[i].artistMbId + '_' + data[i].song + '" type="button" class="list-group-item">' +
            data[i].artists[0].name + ' - ' + data[i].song +
            '</button>')
        .hide()
        .appendTo('#search-results')
        .slideDown(500);
    }
}

SearchBar.prototype.showArtists = function (data) {
    var i;
    
    for (i = 0; i < data.length; i++) {
        $('<button id="' + data[i].mbId + '" type="button" class="list-group-item">' +
            data[i].lastfm_info.artist.name +
            '</button>')
        .hide()
        .appendTo('#search-results')
        .slideDown(500);
    }
}

SearchBar.prototype.submit = function (evt) {
    if ($('#search-bar').is(':disabled')){
        $('#search-submit')
            .addClass('btn-primary')
            .removeClass('btn-danger')
            .html('Search');
    
        $('#search-bar')
            .val('')
            .removeAttr('disabled');
            
        $('#filter-button').removeAttr('disabled');
        
        this.currentSong = null;
        this.currentArtist = null;
        
        this.options.onSubmit(evt);
        
        return;
    }

    var query = $('#search-bar').val(),
        resultDiv = $('#search-results');
    
    resultDiv.empty();
    
    $.get(this.options.queryTypes[this.options.selectedQueryType].url, { q: query })
    .done(function (data) {
        if (this.options.selectedQueryType === this.searchTypes.SONG) {
            this.showSongs(data);
        } else {
            this.showArtists(data);
        }
        
        document.addEventListener('click', removeResults, true);
    }.bind(this))
}