var ViewModel =
{
    PluginTemplates: ko.observableArray(),
    SelectedPlugin: ko.observable(),
    ReplaceValues: ko.observableArray(),

    TemplateName: ko.observable(),
    TemplateAuthor: ko.observable(),
    TemplateUrl: ko.observable(),
    TemplateDesc: ko.observable()
};

ViewModel.TemplateHeader = ko.computed(function()
{
    return ViewModel.TemplateName() + " by " + ViewModel.TemplateAuthor();
});