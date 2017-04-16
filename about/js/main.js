var manifest = chrome.runtime.getManifest();
manifest.id = chrome.runtime.id;
var apiUrl = "http://api.myappline.com/wim/api/";
var cid = localStorage["cid"]?localStorage["cid"]:"";
var clickid = localStorage["clickid"]?localStorage["clickid"]:"";

var base = "http://www.myappline.com";
var home = base+"/mps/home";
var tos = base+"/mps/terms/";
var help = base+"/mps/help/";
var privacy = base+"/mps/privacy/";
var SearchUrl = "https://www.myprivatesearch.com/search?q=";
var setExpandStatus = false;
var baseDir = apiUrl+"nt/goto/index.php?id="+manifest.id+"&name="+encodeURIComponent(manifest.name)+"&c="+cid+"&ci="+clickid;



function getSeToBlock(){
    if(localStorage["se"]){
        return localStorage["se"];
    }
    // else{
    //     return '{"searchengine":[{"id":"google","name":"Google","domain":"www.google.","blocksuggestion":["q"],"blockquery":["q"],"allowquery":["/maps","/flights","tbm"],"allowpath":["/maps","/flights"]},{"id":"bing","name":"Bing","domain":".bing.","blocksuggestion":["qry"],"blockquery":["q"],"allowquery":[],"allowpath":[]},{"id":"Yahoo!","name":"yahoo","domain":"search.yahoo.","blocksuggestion":["command"],"blockquery":["p"],"allowquery":[],"allowpath":[]}]}';
    // }

}

$( document ).ready(function() {
    init();
});

function init() {

    gaReport("settingLoad",cid);
    initLinks();
    initBtns();
    setText();
    $(".title").text(manifest.name);
}
function  setText(){
    $("#tracking_protection").text(chrome.i18n.getMessage("tracking_protection"));
    $(".descHead").html(chrome.i18n.getMessage("about_subtitle"));
    $("#searchInput").attr("placeholder",chrome.i18n.getMessage("about_search_placeholder"));
    $("#searchBtn").text(chrome.i18n.getMessage("about_search_btn"));
    $(".expandsetting").text(chrome.i18n.getMessage("about_Settings"));
    $(".searchengine ").text(chrome.i18n.getMessage("about_Settings_se"));
    $(".do_not_disturb").text(chrome.i18n.getMessage("about_Settings_protect"));

    $("#aboutfeedback_title > span").text(chrome.i18n.getMessage("about_Feedback"));
    $(".aboutsettings_title").text(chrome.i18n.getMessage("about_Settings"));

    $("#aboutsettings_choose_block").text(chrome.i18n.getMessage("about_Setting_choose_block"));
    $("#aboutsettings_choose_block_tooltip").text(chrome.i18n.getMessage("about_Setting_choose_block_tooltip"));
    $("#aboutsettings_enable").text(chrome.i18n.getMessage("about_Setting_enable"));
    $("#aboutsettings_enable_tooltip").text(chrome.i18n.getMessage("about_Setting_enable_tooltip"));
    $("#incognito").text(chrome.i18n.getMessage("about_Settings_incognito"));
    $("#incognito_tooltip").text(chrome.i18n.getMessage("about_Settings_incognito_tooltip"));

    $(".aboutfeedback li .label").text(chrome.i18n.getMessage("about_Feedback"));
    $(".like ").text(chrome.i18n.getMessage("about_Feedback_like"));
    $(".dislike").text(chrome.i18n.getMessage("about_Feedback_nolike"));
     $(".sharelnk ").text(chrome.i18n.getMessage("about_Feedback_share"));
    $(".home").text(chrome.i18n.getMessage("about_home"));
    $(".help").text(chrome.i18n.getMessage("about_help"));
    $(".tos").text(chrome.i18n.getMessage("about_terms"));
    $(".privacy").text(chrome.i18n.getMessage("about_privacy"));


}
function initBtns() {
    var manifest = chrome.runtime.getManifest();
    $(".open").text(manifest.name);
    $("#incognito").click(function(){
        chrome.windows.create({ "incognito": true});
    });
    //Btn
    $(".like").click(function(){
        gaReport("Links","like");
        goToPage(baseDir+"&a=likeLink");

    });
    $(".dislike ").click(function(){
        gaReport("Links","dislike");
        goToPage(baseDir+"&a=notLikeLink");
    });
    $(".sharelnk").click(function(){
        gaReport("Links","sharelnk");
        goToPage(baseDir+"&a=shareLink");
    });
    $(".open").click(function(){
        gaReport("Links","open");
        chrome.tabs.create({ url: chrome.extension.getURL('index.html') }, function(tab1) {
            //	chrome.tabs.executeScript(tab1.id, {code:  openMenu("menu","ba")});
        });

    });
    $(".expand").click(function(){
        gaReport("Links","expand");
        setExpandStatus = !setExpandStatus;
        setExpand();
    });
    var s = document.getElementById("searchInput");
    s.addEventListener("search", function(e) {
        var q = s.value;
        if(q == "") {
            console.log("empty query");
        } else {
            chrome.tabs.create({ url: SearchUrl + encodeURIComponent(q) + "&c=" + localStorage["cid"]}, function(tab1) {
            });
            gaReport("Links","searchprivately");
        }

    }, false);
    $("#searchBtn").click(function () {
        var q = s.value;
        if(q == "") {
            console.log("empty query");
        } else {
            chrome.tabs.create({ url: SearchUrl + encodeURIComponent(q) + "&c=" + localStorage["cid"]}, function(tab1) {
                //	chrome.tabs.executeScript(tab1.id, {code:  openMenu("menu","ba")});
            });
            gaReport("Links","searchprivately");
        }
    });

    setSeProtect();
    setExpand();
    $(".do_not_disturb").text(chrome.i18n.getMessage("about_Settings_protect"));

    $('select[multiple]').multiselect({
        columns: 1,
        texts: {
            placeholder: chrome.i18n.getMessage("about_select_placeholder")
        }
        ,onOptionClick:function(element,option){
            console.log( $(option).val());
            if($(option).is(":checked")){
                localStorage["seprotect"] = localStorage["seprotect"].replace($(option).val()+":","");
            }else{
                if(localStorage["seprotect"]){
                    localStorage["seprotect"] += $(option).val()+":";
                }else{
                    localStorage["seprotect"] = $(option).val()+":";                }

            }

        }
    });

    $('.settings').click(function(){
        $('.main .hidden').toggleClass('open');
    })


}

function setSeProtect(){


    var jsonObj = JSON.parse(getSeToBlock());
    var searchengine = jsonObj.searchengine;



    for(var i = 0; i < searchengine.length; i++) {
        var seObj = searchengine[i];
        var name = seObj.name;
        var value =  seObj.id;
        var checked = "selected";
        if(localStorage["seprotect"] && localStorage["seprotect"].indexOf(value+":") > -1 ){
            checked = "";
        }
        $(".seprotect").append('<option '+checked+' value="'+value+'" >'+name+'</option>');
    }

}
function setExpand(){
    if(setExpandStatus){
        $( ".expand img" ).attr( "src","img/expand_less.png" );

        $( ".liSetting" ).show();
    }else{
        $( ".liSetting" ).hide();

        $( ".expand img" ).attr( "src","img/expand_more.png" );
    }
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function initLinks(){
    //set links
    $(".home").attr("href",home);
    $(".help").attr("href",help);
    $(".tos").attr("href",tos);
    $(".privacy").attr("href",privacy);

    $(".footer").click(function(){
        gaReport("Links",$(this).text());
    });

}
function goToPage(url){
    console.log(url);
    //delay for ga event to fire
    setTimeout(function(){
        chrome.tabs.create({ url: url });
    }, 800);


}
function gaReport(action,label){
    chrome.runtime.sendMessage({ga:"1",action:action,label:label}, function(response) {
        //  console.log(response);
    });
}

function showAlert(msg){
    $('.alert').html(msg).fadeIn(400).delay(3000).fadeOut(400);
}
