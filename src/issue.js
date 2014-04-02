var JIRAEdges = JIRAEdges || {};

(function (undefined) {
  var DOM = JIRAEdges.DOM;
  var map = Array.prototype.map;

  JIRAEdges.Issue = function (container) {
    this.container = container;

//    DOM.forEach(this.container, '#view-subtasks .issuerow .progress', function (progress) {
//      var details = Array.prototype.map.call(progress.querySelectorAll('td:not([style*=transparent]) > img[title]'), function (image) {
//        var parts = image.getAttribute('title').split(" - ");
//        return '<span title="' + parts[0] + '">' + parts[1] + '</span>';
//      });
//
//      DOM.append(progress, '<div class="jira-edges-progress">' + details.join(" ") + '</div>');
//    });
  };

	JIRAEdges.Issue.prototype.showSubtaskProgress = function () {
		var format = chrome.i18n.getMessage('issueProgressFormat');
		var template = '<div class="jira-edges-progress">{{#progress}}<span title="{{name}}">{{duration}}</span>{{/progress}}</div>';

		var extractProgress = function (image) {
			return JIRAEdges.match(format, image.getAttribute('title'));
		};
//		var forEachSubtaskProgress = function (callback) {
//			DOM.forEach(this.container, '#view-subtasks .issuerow .progress', callback);
//		};
//		var mapProgressImages = function (progress, callback) {
//			return Array.prototype.map.call(progress.querySelectorAll('td:not([style*=transparent]) > img[title]'), callback);
//		};
//		var renderProgress = function (progress) {
//			return Mustache.render(template, { progress: mapProgressImages(progress, extractProgress) });
//		};
//
//		forEachSubtaskProgress(function (progress) {
//			DOM.append(progress, renderProgress(progress));
//		});

		DOM.forEach(this.container, '#view-subtasks .issuerow .progress', function (progress) {
			DOM.append(progress, Mustache.render(template, {
				progress: map.call(progress.querySelectorAll('td:not([style*=transparent]) > img[title]'), extractProgress)
			}));
		});
	};
})();

var issue = new JIRAEdges.Issue(document);
issue.showSubtaskProgress();

