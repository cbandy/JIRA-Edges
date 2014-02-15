var JIRAEdges = JIRAEdges || {};

(function (undefined) {
  var DOM = JIRAEdges.DOM;
  var extend = JIRAEdges.extend;
  var forEach = Array.prototype.forEach;

  const PLANNING_BACKLOG = 'jira-edges-planning-backlog';
  const PLANNING_DONE = 'jira-edges-not-planning';
  const PLANNING_SPRINT_ISSUES_CHANGED = 'jira-edges-planning-sprint-issues-changed';
  const PLANNING_SPRINT_VISIBLE = 'jira-edges-planning-sprint-visible';

  const PLANNING_SPRINT_SELECTOR = '#ghx-content-group div.js-sprint-container';

  var planningSprintIsExpanded = function (sprint) {
    return sprint.classList.contains('ghx-open') && sprint.classList.contains('ui-droppable');
  };

  JIRAEdges.RapidBoard = function (container) {
    this.container = container;
    this.sprintIssues = {};

    this.observePlanningMode();

    addEventListener(PLANNING_DONE, this.handlePlanningDone.bind(this));
    addEventListener(PLANNING_SPRINT_ISSUES_CHANGED, this.handlePlanningSprintIssuesChanged.bind(this));
    addEventListener(PLANNING_SPRINT_VISIBLE, this.handlePlanningSprintVisible.bind(this));
  };

  extend(JIRAEdges.RapidBoard.prototype, {
    getSprintIssues: function (sprintId) {

      var dispatchPlanningSprintIssuesChanged = function () {
        dispatchEvent(new CustomEvent(PLANNING_SPRINT_ISSUES_CHANGED, { detail: sprintId }));
      };

      var readResult = function (searchResult) {
        searchResult.issues.forEach(
          function (issue) { this.sprintIssues[sprintId][issue.key] = issue.fields; },
          this
        );
      };

      var query = {
        fields: ["assignee"],
        jql: "sprint = " + sprintId + " AND issuetype in standardIssueTypes()"
      };

      this.sprintIssues[sprintId] || (this.sprintIssues[sprintId] = {});

      JIRAEdges.JIRA.getSearchResults(query, readResult.bind(this), dispatchPlanningSprintIssuesChanged);
    },

    handlePlanningSprintIssuesChanged: function (event) {
      var sprintId = event.detail;
      var issues = this.sprintIssues[sprintId],
        issueSelector = PLANNING_SPRINT_SELECTOR + '[data-sprint-id="' + sprintId + '"] div.js-issue',
        self = this;

      DOM.forEach(self.container, issueSelector, function (issue) {
        var assignee = issues[issue.dataset.issueKey].assignee;
        if (assignee) self.showIssueAssignee(issue, assignee);
      });
    },

    handlePlanningSprintVisible: function (event) {
      var sprintId = event.detail;
      this.sprintIssues[sprintId] || this.getSprintIssues(sprintId);
    },

    handlePlanningDone: function (event) {
      var self = this;
      forEach.call(event.detail, function (removedNode) {
        DOM.forEach(removedNode, PLANNING_SPRINT_SELECTOR, function (sprint) {
          delete self.sprintIssues[sprint.dataset.sprintId];
        });
      });
    },

    observePlanningMode: function () {
      var container = this.container;

      var dispatchPlanningBacklog = function () {
        dispatchEvent(new CustomEvent(PLANNING_BACKLOG));
      };

      var dispatchPlanningDone = function (removedNodes) {
        dispatchEvent(new CustomEvent(PLANNING_DONE, { detail: removedNodes }));
      };

      var dispatchPlanningSprintVisible = function (sprintId) {
        dispatchEvent(new CustomEvent(PLANNING_SPRINT_VISIBLE, { detail: sprintId }));
      };

      var observeSprints = function (container) {
        DOM.forEach(container, 'div.js-sprint-container', function (sprint) {
          DOM.observe(sprint, { attributes: true, attributeFilter: ['class'] }, function (mutations) {
            if (planningSprintIsExpanded(sprint)) dispatchPlanningSprintVisible(sprint.dataset.sprintId);
          });
        });
      };

      DOM.observe(container.querySelector('#ghx-plan'), { childList: true }, function (mutations, observer) {
        var mutation = mutations[0];
        if (mutation.addedNodes.length === 0)
          dispatchPlanningDone(mutation.removedNodes);
        else
          switch (mutation.addedNodes[0].id) {
            case 'ghx-content-group':
              dispatchPlanningBacklog();
              observeSprints(mutation.addedNodes[0]);
              break;
            case 'ghx-plan-group':
              observer.observe(container.querySelector('#ghx-backlog'), { childList: true });
              break;
          }
      });
    },

    showIssueAssignee: function (issue, assignee) {
      var avatar = '<img src="{{url}}" alt="{{name}}" title="'
        + chrome.i18n.getMessage("assigneeName", "{{name}}")
        + '" style="margin-right:5px; vertical-align:middle" />';

      DOM.prepend(
        issue.querySelector('div.ghx-end'),
        Mustache.render(avatar, { name: assignee.displayName, url: assignee.avatarUrls['16x16'] })
      );
    },
  });

})();

new JIRAEdges.RapidBoard(document);
