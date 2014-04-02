describe("Issue", function () {
  var fixtures = {
    subtask_not_started:
      ['<div id="view-subtasks">',
        '<table id="issuetable">',
          '<tbody>',
          '<tr id="issuerow30159" rel="30159" data-issuekey="XXX-932" class="issuerow">',
            '<td class="progress">',
              '<table id="tt_dpb_graph_outer_XXX-932" cellpadding="0" cellspacing="0">',
                '<tbody><tr>',
                  '<td class="tt_graph_percentage">',
                    '<p id="tt_dpb_percent_XXX-932">0%</p>',
                  '</td>',
                  '<td style="width:100%">',
                    '<table id="tt_dpb_graph_inner_XXX-932" style="width:9%;" cellpadding="0" cellspacing="0">',
                      '<tbody>',
                      '<tr class="tt_graph">',
                        '<td>',
                          '<table class="tt_graph" id="tt_dpb_graph_orig_XXX-932" cellpadding="0" cellspacing="0" style="margin-bottom: 2px;">',
                            '<tbody><tr class="tt_graph">',
                              '<td style="width:100%; background-color:#89afd7;">',
                                '<img src="/images/border/spacer.gif" class="hideOnPrint" title="Original Estimate - 1 hour" alt="Original Estimate - 1 hour">',
                              '</td>',
                            '</tr></tbody>',
                          '</table>',
                        '</td>',
                      '</tr>',
                      '<tr>',
                        '<td>',
                          '<table class="tt_graph" id="tt_dpb_graph_progress_XXX-932" cellpadding="0" cellspacing="0">',
                            '<tbody><tr class="tt_graph">',
                              '<td style="width:100%; background-color:#ec8e00; border:0; font-size:0;">',
                                '<img src="/images/border/spacer.gif" class="hideOnPrint" title="Remaining Estimate - 1 hour" alt="Remaining Estimate - 1 hour">',
                              '</td>',
                            '</tr></tbody>',
                          '</table>',
                        '</td>',
                      '</tr>',
                      '</tbody>',
                    '</table>',
                  '</td>',
                '</tr></tbody>',
              '</table>',
            '</td>',
          '</tr>',
          '</tbody>',
        '</table>',
      '</div>'].join('')
  };

  var renderedTemplate
    , template = '<div class="jira-edges-progress">{{#progress}}<span title="{{name}}">{{duration}}</span>{{/progress}}</div>';

  beforeEach(function () {
    chrome.i18n = { getMessage: function () {} };
    Mustache = { render: function () {} };

    spyOn(chrome.i18n, 'getMessage').and.returnValue('(?<name>.+) - (?<duration>.+)');
    spyOn(Mustache, 'render').and.returnValue(renderedTemplate);

//    jasmine.addMatchers({
//      toBe
//    });
  });

  describe("when a subtask is not started", function () {
    it("shows the original and remaining estimates", function () {
      jasmine.fixtures.set(fixtures['subtask_not_started']);
      renderedTemplate = '<div class="bandy"></div>';

      var container = jasmine.fixtures.container;
      var issue = new JIRAEdges.Issue(container);
      issue.showSubtaskProgress();

      var c = jasmine.objectContaining({
        progress: jasmine.objectContaining({ name: 'Original Estimate', duration: '1 hour' })
      });
      expect(Mustache.render).
      toHaveBeenCalledWith(template, c);
      expect(container.querySelector('.bandy')).not.toBe(null);
    });
  });

  describe("when a subtask is in progress", function () {
    it("shows the time spent and the original and remaining estimates");
  });

  describe("when a subtask is completed", function () {
    it("shows the time spent and the original estimate");
  });

  describe("when a subtask is overbudget", function () {
    it("shows the time spent and the original estimate");
  });
});
