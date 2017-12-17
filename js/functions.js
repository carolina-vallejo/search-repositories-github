(function($, window, document) {

  //----VARIABLES
  var urlRepos = "https://api.github.com/search/repositories?";
  var query = "Javascript"
  var pageRepo = 1;
  var per_page = 12;
  var actualUrlSubscriber = '';
  var actualRepoName = '';
  var actualNumRepos = 0;

  //----SELECTORS
  var $loader,
    $messages,
    $htmlBody,
    $title,
    $reposContainer,
    $subscribersContainer;

  //----OBJECTS

  var itemList = {
    'repository': {
      'class': 'item-repo',
      'messages': {
        'nodata': (function(query) {
          return 'We couldn’t find any repositories matching <span>' + query + '</span>';
        })()
      },
      'callback': function(par1, par2) {
        printRepositories(par1, par2);
      }
    },
    'subscriber': {
      'class': 'item-subscriber',
      'messages': {
        'nodata': (function(query) {
          return 'No subscribers';
        })()
      },
      'callback': function(par1, par2) {
        printSubscribers(par1, par2);
      }
    }
  };

  //-- ON DOCUMENT READY
  $(function() {

    /* ----------------------- 
        STORE SELECTORS
     -------------------------- */
    $htmlBody = $('html,body');
    $reposContainer = $('#repositories-list');
    $subscribersContainer = $('#subscribers-list');
    $loader = $('#loader');
    $messages = $('#messages');
    $textInput = $("#text-input");
    $searchInput = $("#search-btn");
    $backReposBtn = $('#back-repos-btn');
    $paginationRepos = $('#pagination-repos');
    $title = $('#title');

    /* ----------------------- 
        ON LOAD SHOW LIST OF 
        "AMAZING" REPOSITORIES
     -------------------------- */

    $loader.addClass('animate');
    getData(urlRepos + getParameters(), 'repository');


    /* ----------------------- 
        SEARCH INTERACTIONS
     -------------------------- */
    $textInput.keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault();
        $searchInput.trigger('click');
      }
    });

    $searchInput.on('click', function() {

      $backReposBtn.trigger('click');

      $messages.empty();
      $loader.addClass('animate');
      pageRepo = 1;

      query = $textInput.val();

      if (query.length !== 0) {

        getData(urlRepos + getParameters(), 'repository');

      } else {

        $('.' + itemList['repository'].class).remove();
        $loader.removeClass('animate');
        $title.empty();
        $messages.text('Please write something!!');
        $paginationRepos.hide();

      }

    });

    /* ----------------------- 
        SUSBCRIBERS 
        LIST INTERACTIONS
     -------------------------- */
    $reposContainer.on('click', '.subscribers-link', function(e) {
      e.preventDefault();

      var $this = $(this);

      actualUrlSubscriber = $this.attr('data-url');
      actualRepoName = $this.attr('data-reponame');

      //--- HIDE
      $reposContainer.hide();
      $paginationRepos.hide();
      //--- SHOW
      $subscribersContainer.show();
      $backReposBtn.show();

      $loader.addClass('animate');

      //--- GET DATA & PRINT SUBSCRIBERS
      getData(actualUrlSubscriber, 'subscriber');

    });
    /* ----------------------- 
        BACK TO REPOS BUTTON
     -------------------------- */

    $backReposBtn.on('click', function() {

      //--CLEAN & HIDE 
      $messages.empty();
      $backReposBtn.hide();
      $subscribersContainer.hide();

      //-- SHOW REPOS
      $paginationRepos.show();
      $reposContainer.show();
      //-- UPDATE TITLE
      $title.html('<span>' + query + '</span>'+ actualNumRepos +' repositories');
    });

    /* ----------------------- 
        PAGINATION INTERACTION
     -------------------------- */
    $paginationRepos.on('click', '.link-pag', function() {

      var $this = $(this);
      var i = $this.text();
      var numpages = Math.ceil(actualNumRepos / per_page);


      if (i === 'prev') {
        if (pageRepo > 1) {

          pageRepo -= 1;
          getData(urlRepos + getParameters(), 'repository');
          $('.active-pag').removeClass('active-pag');
          $('.link-pag').eq(pageRepo).addClass('active-pag');

        }
      } else if (i === 'next') {
        if (pageRepo < numpages) {

          pageRepo += 1;
          getData(urlRepos + getParameters(), 'repository');
          $('.active-pag').removeClass('active-pag');
          $('.link-pag').eq(pageRepo).addClass('active-pag');

        }
      } else {

        pageRepo = parseInt(i);
        getData(urlRepos + getParameters(), 'repository');

        if (pageRepo <= 5 || pageRepo === numpages) {

          $('.active-pag').removeClass('active-pag');
          $this.addClass('active-pag');

        }
      }

      $messages.empty();
      $loader.addClass('animate');
    });


  }); //---END ON READY

  /*============ FUNCTIONS ===============*/

  function getData(url, item) {

    var typeItem = itemList[item].class;

    //---LOAD DATA
    d3.json(url, function(error, data) {

      if (error) {

        $messages.html('Sorry something happened (maybe rate limit..),<br> wait a minute and reload the page!');

        throw error

      } else if (data.length === 0) {

        $('.' + typeItem).remove();
        $title.empty();

        $messages.html(itemList[item].nodata());

      } else {

        itemList[item].callback(data, typeItem);
      }

      $loader.removeClass('animate');
      $htmlBody.animate({ scrollTop: 0 }, 600);

    });

  }


  function printSubscribers(data, typeItem) {

    $title.html('<span>' + actualRepoName + '</span> Repository subscribers');

    var container = d3.select('#subscribers-list')

    // DATA JOIN
    var item = container.selectAll('.' + typeItem)
      .data(data);

    /* ----------------------- 
         UPDATE OLD ELEMENTS
    -------------------------- */

    //--- AVATAR
    item
      .select('.img-avatar')
      .attr('src', function(d) {
        return d.avatar_url;
      });

    //--- NAME
    item
      .select('.subscriber-name')
      .text(function(d) {
        return d.login;
      });


    /* ----------------------- 
         ENTER NEW ELEMENTS
    -------------------------- */

    var updatedItem = item.enter()
      .append('div')
      .attr('class', typeItem)

    //--- INNER PADDINDG
    var inner = updatedItem
      .append('div')
      .attr('class', 'inner-padding')

    //--- AVATAR
    inner
      .append('div')
      .attr('class', 'avatar')
      .append('img')
      .attr('class', 'img-avatar')
      .attr('src', function(d) {
        return d.avatar_url;
      });
    //--- NAME
    inner
      .append('div')
      .attr('class', 'subscriber-name')
      .text(function(d) {
        return d.login;
      });
    //--- NAME
    var links = inner
      .append('div')
      .attr('class', 'links');

    links
      .append('div')
      .attr('class', 'item-footer')    
      .append('a')
      .attr('class', 'repositories-link')
      .attr('href', function(d) {
        return d.html_url;
      })
      .text('Repositories');

    //--- EXIT & REMOVE
    item.exit().remove();

  }

  function printRepositories(data, itemName) {

    actualNumRepos = data.total_count;
    $title.html('<span>' + query + '</span>'+ data.total_count +' repositories');

    var data = data.items;
    var container = d3.select('#repositories-list')

    // DATA JOIN
    var item = container.selectAll('.' + itemName)
      .data(data);

    /* ----------------------- 
         UPDATE OLD ELEMENTS
    -------------------------- */
    item.select('.language')
      .text(function(d) {
        return d.language;
      });
    //--- AVATAR
    item
      .select('.img-avatar')
      .attr('src', function(d) {
        return d.owner.avatar_url;
      });

    item
      .select('name-login')
      .text(function(d) {
        return d.owner.login;
      });

    //--- FORKS
    item
      .select('.forks-data')
      .text(function(d) {
        return d.forks_count;
      });

    //--- WATCHERS
    item
      .select('.watchers-data')
      .text(function(d) {
        return d.watchers_count;
      });
    //--- REPO INFO
    item
      .select('.repo-title')
      .text(function(d) {
        return d.name;
      })
      .attr('href', function(d) {
        return d.html_url;
      });

    item
      .select('.description')
      .text(function(d) {
        return d.description;
      });

    //--- SUBSCRIBERS LIST
    item
      .select('.subscribers-link')
      .attr('data-url', function(d) {
        return d.subscribers_url;
      })
      .attr('data-reponame', function(d) {
        return d.name;
      });

    /* ----------------------- 
         ENTER NEW ELEMENTS
    -------------------------- */

    var updatedItem = item.enter()
      .append('div')
      .attr('class', itemName)


    //--- INNER PADDINDG
    var inner = updatedItem
      .append('div')
      .attr('class', 'inner-padding');

    //--- LANGUAGE
    inner
      .append('div')
      .attr('class', 'language')
      .text(function(d) {
        return d.language;
      });

    //--- AVATAR
    var user = inner
      .append('div')
      .attr('class', 'user');


    user
      .append('div')
      .attr('class', 'avatar')
      .append('img')
      .attr('class', 'img-avatar')
      .attr('src', function(d) {
        return d.owner.avatar_url;
      });

    user
      .append('div')
      .attr('class', 'name-login')
      .text(function(d) {
        return d.owner.login;
      });

    //--- STATS
    var stats = inner
      .append('div')
      .attr('class', 'stats');

    //--- FORKS
    var forks = stats
      .append('div')
      .attr('class', 'block');

    forks
      .append('span')
      .attr('class', 'forks-data')
      .text(function(d) {
        return d.forks_count;
      });

    forks.append('div')
      .attr('class', 'label-data')
      .text('Forks');

    //--- WATCHERS
    var watchers = stats
      .append('div')
      .attr('class', 'block');

    watchers
      .append('span')
      .attr('class', 'watchers-data')
      .text(function(d) {
        return d.watchers_count;
      });

    watchers.append('div')
      .attr('class', 'label-data')
      .text('Watchers');

    //--- REPO INFO
    var repoInfo = inner
      .append('div')
      .attr('class', 'repo-info');

    repoInfo
      .append('a')
      .attr('class', 'repo-title')
      .text(function(d) {
        return d.name;
      })
      .attr('href', function(d) {
        return d.html_url;
      });

    repoInfo.append('div')
      .attr('class', 'description')
      .text(function(d) {
        return d.description;
      });

    //--- SUBSCRIBERS LIST
    inner
      .append('div')
      .attr('class', 'item-footer')
      .append('span')
      .attr('class', 'subscribers-link')
      .attr('data-url', function(d) {
        return d.subscribers_url;
      })
      .attr('data-reponame', function(d) {
        return d.name;
      })
      .text('Subscribers list');

    //--- EXIT & REMOVE
    item.exit().remove();

    //-- UPDATE PAGINATION
    pagination();

  }



  function pagination() {

    var container = d3.select('#pagination-repos');
    var data = [];

    var numpages = Math.ceil(actualNumRepos / per_page);
    var itemsAvailables = Math.ceil(1000 / per_page);

    var item = container
      .selectAll('span')
      .data(function() {

        //---CREATE DATA FOR PAGINATION
        data = ['prev'];
        if ((actualNumRepos / per_page) <= 5) {
          for (var i = 1; i <= numpages; i++) {
            data.push(i);
          }
        } else if (numpages > 5 && (
            actualNumRepos / per_page) < itemsAvailables) {

          for (var i = 1; i <= 5; i++) {
            data.push(i);
          }
          data.push('...');
          data.push(numpages);

        } else {

          for (var i = 1; i <= 5; i++) {
            data.push(i);
          }
          data.push('...');
          data.push(itemsAvailables);

        }
        data.push('next');
        return data;
      });

    /* ----------------------- 
          UPDATE OLD ELEMENTS
     -------------------------- */
    item
      .text(function(d) {
        return d;
      });

    /* ----------------------- 
         ENTER NEW ELEMENTS
    -------------------------- */
    item.enter()
      .append('span')
      .text(function(d) {
        return d;
      })
      .classed('active-pag', function(d, i) {
        return i === 1 ? true : false;
      })
      .classed('link-pag', function(d, i) {
        return d === '...' ? false : true;
      });



    //--- EXIT & REMOVE
    item.exit().remove();

  }

  function getParameters() {
    return 'q=' + query + '&page=' + pageRepo + '&per_page=' + per_page;
  }


}(window.jQuery, window, document));