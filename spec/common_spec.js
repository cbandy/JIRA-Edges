describe("Common functions", function () {
  describe("clone", function () {
    it("creates a copy of an object", function () {
      var original = { a: "b", c: 1, d: function (e) { return "f"; } };
      var result = JIRAEdges.clone(original);

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
    });
  });

  describe("extend", function () {
    it("copies all properties from one object to another", function () {
      var destination = { a: "b", c: 1 };
      var result = JIRAEdges.extend(destination, { c: "2", d: true });

      expect(result).toBe(destination);
      expect(result).toEqual({ a: "b", c: "2", d: true});
    });
  });

  describe("uriEncode", function () {
    it("turns an object into URI parameters", function () {
      expect(JIRAEdges.uriEncode({ a: "b", c: 1, d: true })).toBe("a=b&c=1&d=true");
    });

    it("escapes special characters", function () {
      expect(JIRAEdges.uriEncode({ "a space": "?" })).toBe("a%20space=%3F");
    });

    it("delimits arrays with escaped commas", function () {
      expect(JIRAEdges.uriEncode({ a: ["b", 1, true] })).toBe("a=b%2C1%2Ctrue");
    });
  });

  describe("DOM functions", function () {
    describe("forEach", function () {
      var callback, container,
        list = ['a', 1, true],
        selector = {};

      beforeEach(function () {
        callback = jasmine.createSpy('function');
        container = jasmine.createSpyObj('element', ['querySelectorAll']);
        container.querySelectorAll.and.returnValue(list);
      });

      it("calls a callback for each selected element", function () {
        JIRAEdges.DOM.forEach(container, selector, callback);

        expect(callback.calls.count()).toBe(3);
        expect(callback).toHaveBeenCalledWith('a', 0, list);
        expect(callback).toHaveBeenCalledWith(1, 1, list);
        expect(callback).toHaveBeenCalledWith(true, 2, list);
      });
    });

    describe("observe", function () {
      var callback = {}, options = {}, target = {};
      var observer;

      beforeEach(function () {
        observer = jasmine.createSpyObj("observer", ["observe"]);
        spyOn(window, "WebKitMutationObserver").and.returnValue(observer);
      });

      it("creates a MutationObserver", function () {
        JIRAEdges.DOM.observe(target, options, callback);
        expect(window.WebKitMutationObserver).toHaveBeenCalledWith(callback);
      });

      it("uses the observer to listen to changes on the target", function () {
        JIRAEdges.DOM.observe(target, options, callback);
        expect(observer.observe).toHaveBeenCalledWith(target, options);
      });
    });

    describe("prepend", function () {
      it("inserts string of HTML into the beginning of a DOM node", function () {
        var existing = 'existing <em>html</em>';
        var html = '<span class="item"><br></span>';
        var target = document.createElement('section');
        target.innerHTML = existing;

        JIRAEdges.DOM.prepend(target, html);
        expect(target.innerHTML).toBe(html + existing);
      });
    });
  });
  
  describe("JIRA Search Results", function () {
    var anyFunction = jasmine.any(Function);
    var searchURL = "/rest/api/2/search";
    var totalResults = 1;

    beforeEach(function () {
      spyOn(JIRAEdges.Network, 'getJSON').
        and.callFake(function (path, data, onSuccess) {
          onSuccess({ maxResults: 10, startAt: data.startAt ? data.startAt : 0, total: totalResults });
        });
    });

    it("invokes the search URL with parameters", function () {
      JIRAEdges.JIRA.getSearchResults({ jql: 'text' }, function () {}, function () {});
      expect(JIRAEdges.Network.getJSON).toHaveBeenCalledWith(searchURL, { jql: 'text' }, anyFunction);
    });

    it("runs a callback for a page of results", function () {
      var callback = jasmine.createSpy('function');
      JIRAEdges.JIRA.getSearchResults({}, callback, function () {});
      expect(callback).toHaveBeenCalledWith({ maxResults: 10, startAt: 0, total: 1 });
    });

    it("runs a callback when there are no more results", function () {
      var callback = jasmine.createSpy('function');
      JIRAEdges.JIRA.getSearchResults({}, function () {}, callback);
      expect(callback).toHaveBeenCalledWith();
    });

    describe("when there is more than one page of results", function () {
      it("requests the maximum possible results for subsequent pages", function () {
        totalResults = 14;

        JIRAEdges.JIRA.getSearchResults({}, function () {}, function () {});
        expect(JIRAEdges.Network.getJSON).toHaveBeenCalledWith(searchURL, {}, anyFunction);
        expect(JIRAEdges.Network.getJSON).toHaveBeenCalledWith(searchURL, { maxResults: 4, startAt: 10 }, anyFunction);
      });
    });
  });
});
