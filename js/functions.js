(function($, window, document) {

  var urlRepos = "https://api.github.com/search/repositories?";
  var query = "d3"
  var pageRepo = 1;
  var pageSubscribers = 1;
  var per_page = 12;
  var actualView = 'repositories';
  var actualUrlSubscriber = '';
  var actualRepoName = '';
  var actualNumRepos = '';

  //----SELECTORS
  var $loader, $messages, $htmlBody, $moreReposBtn, $moreSubscribersBtn, $title, $reposContainer, $subscribersContainer;

  //----VARIABLES
  var itemRepoClass = 'item-repo';
  var itemSubscribersClass = 'item-subscriber';

  //-- ON DOCUMENT READY
  $(function() {

    //--- STORE SELECTORS
    $htmlBody = $('html,body');
    $reposContainer = $('#repositories-list');
    $subscribersContainer = $('#subscribers-list');
    $loader = $('#loader');
    $messages = $('#messages');
    $textInput = $("#text-input");
    $searchInput = $("#search-btn");
    $moreReposBtn = $('#more-repos-btn');
    $moreSubscribersBtn = $('#more-subscribers-btn');
    $backPrevBtn = $('#back-prev-btn');
    $backReposBtn = $('#back-repos-btn');
    $title = $('#title');


    //# ojo la primera busqueda que sea los ultimos repos

    //---SHOW LIST OF D3 REPOSITORIES
    $loader.addClass('animate');
    getReposData();

    //--- INPUT INTERACTIONS
    $textInput.keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault();
        $searchInput.trigger('click');
      }
    });

    $searchInput.on('click', function() {

      $backReposBtn.trigger('click');

      actualView = 'repositories';

      $messages.empty();
      $loader.addClass('animate');
      pageRepo = 1;

      query = $textInput.val();
      getReposData(urlRepos);



    });

    //----MORE REPOS BUTTON 
    //# OJO DECIR QUE SE ESTA VIENDO LA PAGINA UNA DE 20!!!
    $moreReposBtn.on('click', function() {

      $messages.empty();
      $loader.addClass('animate');

      pageRepo += 1;

      console.log(actualView);

      getReposData();
      if (pageRepo > 1) {
        $backPrevBtn.show()
      }

    });


    $backPrevBtn.on('click', function() {
      $messages.empty();
      $loader.addClass('animate');

      pageRepo -= 1;

      console.log(actualView);

      getReposData();

      if (pageRepo === 1) {
        $backPrevBtn.hide();
      }

    });

    //----SUSBCRIBERS LINK INTERACTION
    //# hacer btn volver a resultados de repos

    $reposContainer.on('click', '.subscribers-link', function(e) {

      console.log('click');
      e.preventDefault();

      var $this = $(this);

      actualView = 'subscribers';
      actualUrlSubscriber = $this.attr('data-url');
      actualRepoName = $this.attr('data-reponame');
      pageSubscribers = 1;

      //--- TOGGLE CONTAINERS
      $reposContainer.hide();
      $moreReposBtn.hide();
      $subscribersContainer.show();
      $backReposBtn.show();
      $backPrevBtn.hide();

      $loader.addClass('animate');

      getSubscriberData(actualUrlSubscriber, actualRepoName);


    });

    //----MORE REPOS BUTTON 
    //# OJO DECIR QUE SE ESTA VIENDO LA PAGINA UNA DE 20!!!
    $moreSubscribersBtn.on('click', function() {

      $messages.empty();
      $loader.addClass('animate');

      pageSubscribers += 1;

      console.log(actualView);

      getSubscriberData(actualUrlSubscriber, actualRepoName);

    });



    $backReposBtn.on('click', function() {
      actualView = 'repositories';

      $messages.empty();

      $reposContainer.show();
      $subscribersContainer.hide();
      $backReposBtn.hide();
      $moreReposBtn.show();
      $moreSubscribersBtn.hide();
      $subscribersContainer.hide();
      $title.text(actualNumRepos + ' repositories of ' + query);

      if (pageRepo > 1) {
        $backPrevBtn.show();
      }else{
        $backPrevBtn.hide();
      }
    });

  });

  function getSubscriberData(url, repo) {

    var parameters = '?page=' + pageSubscribers + '&per_page=' + per_page;

    //---LOAD DATA
    d3.json(url + parameters, function(error, data) {

      if (error) {

        $messages.text('Sorry something happend, reload the page!');

        throw error

      } else if (data.length === 0) {

        $moreSubscribersBtn.hide();
        $('.' + itemSubscribersClass).remove();
        $title.text('');
        $messages.html('No subscribers');

      } else {

        //---PRINT NUMBER OF RESULTS
        $title.text(repo + ' subscribers');

        subscribers(data);

        //---SHOW OR HIDE MORE REPOS BTN
        if (data.length < per_page) {
          $moreSubscribersBtn.hide();
        } else {
          $moreSubscribersBtn.show();
        }

      }

      $loader.removeClass('animate');
      $htmlBody.animate({ scrollTop: 0 }, 600);

    });

  }


  function getReposData() {

    var parameters = 'q=' + query + '&page=' + pageRepo + '&per_page=' + per_page;

    if (query.length !== 0) {

      //---LOAD DATA
      d3.json(urlRepos + parameters, function(error, data) {
        //d3.json('data/repositories.json', function(error, data) {

        if (error) {

          $messages.text('Sorry something happend, reload the page!');

          throw error

        } else if (data.items.length === 0) {

          $moreReposBtn.hide();
          $('.' + itemRepoClass).remove();
          $messages.html('We couldn’t find any repositories matching <span>' + query + '</span>');

        } else {

          //---PRINT NUMBER OF RESULTS
          actualNumRepos = data.total_count;
          $title.text(data.total_count + ' repositories of ' + query);

          repositories(data.items);

          //---SHOW OR HIDE MORE REPOS BTN
          if (data.items.length < per_page) {
            $moreReposBtn.hide();
          } else {
            $moreReposBtn.show();
          }

        }

        $loader.removeClass('animate');
        $htmlBody.animate({ scrollTop: 0 }, 600);

      });
    } else {

      $moreReposBtn.hide();
      $('.' + itemRepoClass).remove();
      $loader.removeClass('animate');
      $title.empty();
      $messages.text('Please try with another query!!');

    }


  }

  function subscribers(data) {

    console.log(data);

    var g = d3.select('#subscribers-list')

    // DATA JOIN
    var item = g.selectAll('.' + itemSubscribersClass)
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
      .attr('class', itemSubscribersClass)

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
      .append('a')
      .attr('class', 'repositories-link')
      .attr('href', function(d) {
        return d.html_url;
      })
      .text('Repositories');





    //--- EXIT & REMOVE
    item.exit().remove();

  }

  function repositories(data) {

    console.log(data);

    var g = d3.select('#repositories-list')

    // DATA JOIN
    var item = g.selectAll('.' + itemRepoClass)
      .data(data);

    /* ----------------------- 
         UPDATE OLD ELEMENTS
    -------------------------- */
    item.select('.language')
      .text(function(d) {
        return d.language;
      })
    //--- AVATAR
    item
      .select('.img-avatar')
      .attr('src', function(d) {
        return d.owner.avatar_url;
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
      .attr('class', itemRepoClass)

    //--- LANGUAGE
    updatedItem
      .append('div')
      .attr('class', 'language')
      .text(function(d) {
        return d.language;
      });

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
        return d.owner.avatar_url;
      });

    //--- STATS
    var stats = inner
      .append('div')
      .attr('class', 'stats');

    //--- FORKS
    var forks = stats
      .append('div')
      .attr('class', 'block')
      .append('span')
      .attr('class', 'forks-data')
      .text(function(d) {
        return d.forks_count;
      });

    forks.append('div')
      .attr('class', 'label')
      .text('Forks');

    //--- WATCHERS
    var watchers = stats
      .append('div')
      .attr('class', 'block')
      .append('span')
      .attr('class', 'watchers-data')
      .text(function(d) {
        return d.watchers_count;
      });

    watchers.append('div')
      .attr('class', 'label')
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

  }


}(window.jQuery, window, document));