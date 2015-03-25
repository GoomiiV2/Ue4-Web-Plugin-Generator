var ZipFileData = null;
var ExtsToRepalceIn = ["cpp", "h", "uplugin", "cs"];

$(document).ready(function()
{
    GetPluginTemplates();
    ko.applyBindings(ViewModel);
});

ViewModel.SelectedPlugin.subscribe(function(newValue)
{
    LoadPlugin(newValue);
});

function LoadPlugin(url)
{
    url += "/Meta.json";

    $.getJSON(url, function(data)
    {
        ViewModel.TemplateName(data.Name);
        ViewModel.TemplateAuthor(data.Author);
        ViewModel.TemplateUrl(data.Site);
        ViewModel.TemplateDesc(data.Desc);
        ViewModel.ReplaceValues(data.ReplaceValues);

        // Now get the zip in memory
        JSZipUtils.getBinaryContent(data.Zip, function(err, zipData)
        {
            if(err)
            {
                console.warn("Error loading zipfile: "+err);
            }
            else
            {
                ZipFileData = zipData;
            }
        });
    });
}

function GetPluginTemplates()
{
    $.getJSON("pluginBases.json", function(data)
    {
        ViewModel.PluginTemplates(data.Plugins);
    });
}

function CreatePlugin()
{
    var Replacements = {};

    for (var i = 0; i < ViewModel.ReplaceValues().length; i++)
    {
        var temp = ViewModel.ReplaceValues()[i];
        Replacements[temp.Value] = temp._RepalceWith;
    }

    // Read the zip
    if (ZipFileData != null)
    {
        var zip = new JSZip(ZipFileData);
        var outZip = new JSZip();

        $.each(zip.files, function (index, zipEntry)
        {
            var FileName = ReplaceWithValues(zipEntry.name, Replacements);
            if (ExtsToRepalceIn.indexOf(GetFileExtension(zipEntry.name)) != -1)
            {
                var newFile = ReplaceWithValues(zipEntry.asText(), Replacements);
                outZip.file(FileName, newFile, {binary:false});
            }
            else
            {
                outZip.file(FileName, zipEntry.asBinary(), {binary:true});
            }
        });

        //window.location = "data:application/zip;base64," + outZip.generate({type:"base64"});
        try
        {
            var blob = outZip.generate({type:"blob"});
            saveAs(blob, "Plugin.zip");
        }
        catch(e)
        {
            alert("Error when trying to save zip, maybe you are using an old browser?");
        }
    }
    else
    {
        alert("The zip hasn't loaded yet, please wait abit and try again");
    }
}

function ReplaceWithValues(str, replacements)
{
    var data = str;
    for (var name in replacements)
    {
        if (replacements.hasOwnProperty(name))
        {
            var tag = GetReplaceTag(name);
            data = data.replace(new RegExp(tag, 'g'), replacements[name]);
        }
    }

    return data;
}

function GetReplaceTag(tag)
{
    return "{{"+tag+"}}";
}

// http://stackoverflow.com/a/1203361
function GetFileExtension(filename)
{
    var a = filename.split(".");
    if( a.length === 1 || ( a[0] === "" && a.length === 2 ) )
    {
        return "";
    }
    return a.pop();
}