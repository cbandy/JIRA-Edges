var JIRAEdges = JIRAEdges || {};
JIRAEdges.DOM || (JIRAEdges.DOM = {});
JIRAEdges.JIRA || (JIRAEdges.JIRA = {});
JIRAEdges.Network || (JIRAEdges.Network = {});

// https://docs.atlassian.com/jira/REST/ondemand/

(function (undefined) {

  var extend = function (destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  };
  
  extend(JIRAEdges, {
    clone: function (object) { return extend({}, object); },
    extend: extend,

    uriEncode: function (data) {
      var key, result = [];
      for (key in data) result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      return result.join("&");
    },
  });

  extend(JIRAEdges.DOM, {
    forEach: function (container, selector, callback) {
      Array.prototype.forEach.call(container.querySelectorAll(selector), callback);
    },

    observe: function (target, options, callback) {
      (new WebKitMutationObserver(callback)).observe(target, options);
    },

    prepend: function (target, html) {
      var fragment = document.createElement('div');
      fragment.innerHTML = html;
      target.insertBefore(fragment.firstChild, target.firstChild);
    },
  });

  extend(JIRAEdges.JIRA, {
    getSearchResults: function (query, onResult, onFinish) {
      JIRAEdges.Network.getJSON("/rest/api/2/search", query, function (searchResult) {
        onResult(searchResult);

        var nextPage = searchResult.startAt + searchResult.maxResults;
        var remaining = searchResult.total - nextPage;

        if (remaining <= 0)
          onFinish();
        else
          JIRAEdges.JIRA.getSearchResults(
            extend(JIRAEdges.clone(query), { maxResults: remaining, startAt: nextPage }),
            onResult,
            onFinish
          );
      });
    },
  });

  extend(JIRAEdges.Network, {
    getJSON: function (path, data, onSuccess, onFailure) {
      var client = new XMLHttpRequest();
      client.onreadystatechange = function () {
        if (client.readyState !== 4) return;
        if (client.status !== 200) { if (onFailure) onFailure(client); return; }
        if (onSuccess) onSuccess(JSON.parse(client.responseText));
      };
  
      if (data) path += (/\?/.test(path) ? "&" : "?") + JIRAEdges.uriEncode(data);
  
      client.open("GET", path, true);
      client.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
      client.send();
    },
  });

})();
