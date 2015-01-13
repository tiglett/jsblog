var siteRootURL = window.location.host;
var ViewModes = {
    SINGLE: 0,
    STREAM: 1
};
var Errors = {
    NO_RESPONSE_TEXT: 0,
    INVALID_JSON: 1
};
var currentViewMode = ViewModes.STREAM;
var postList;

function initBlog() {
    var titleObject = document.getElementById("titleLink");
    titleObject.addEventListener("click", function(evt) {
        evt.preventDefault();
        loadLastXPosts(5);
    });
    getPostList(function() {
        loadLastXPosts(5);
    });
}

function loadLastXPosts(numPosts) {
    if(postList) {
        clearPosts();
        var i;
        for(i=0; i<postList.length && i<5; i++) {
            pushPost(postList[i].name);
        }
    }

}

function getPostFromList(post) {
    var i;
    for(i=0; i<postList.length; i++) {
        if(postList[i].name == post) {
            return postList[i];
        }
    }

    return null;
}

function clearPosts() {
    var postContainer = document.getElementById("postContainer");
    var children = postContainer.children;
    var i;
    for(i=0; i<children.length; i++) {
        if(children.item(i).nodeName == "ARTICLE") {
            postContainer.removeChild(children.item(i));
            i--;
        }
    }
}

function getPostList(callback) {
    var xhtr = new XMLHttpRequest();
    xhtr.addEventListener("load", function() {
        receivePostList(this);
        callback();
    }, false);
    xhtr.open("GET", "http://" + siteRootURL + "/posts/postList.json", true);
    xhtr.send();
}

function loadPost(name, callback) {
    var xhtr = new XMLHttpRequest();
    xhtr.addEventListener("load", function() {
        try {
            callback(receivePost(this), null);
        } catch(e) {
            callback(null, e);
        }
    }, true);
    xhtr.addEventListener("error", function() {
        callback(null, "Error");
    }, true);
    xhtr.open("GET", "http://" + siteRootURL + "/posts/" + name, true);
    xhtr.send();
}

function receivePost(response) {
    if(response.responseText) {
        try {
            var postNode = document.createElement("article");
            var markdownText = postFilter(response.responseText);
            postNode.innerHTML = markdown.toHTML(markdownText);
            var postNodeText = document.createTextNode(response.responseText);
            return postNode;
        } catch (e) {
            throw Errors.INVALID_JSON;
        }
    } else {
        throw Errors.NO_RESPONSE_TEXT;
    }
}

function loadSinglePost(post) {
    currentViewMode = ViewModes.SINGLE;
    clearPosts();
    pushPost(post);
}

function pushPost(post) {
    var postContainer = document.getElementById("postContainer");
    loadPost(post, function(postNode, err) {
        if(!err) {
            var postItemFromList = getPostFromList(post);
            if(!(postItemFromList == undefined || postItemFromList == null)) {
                var timeNode = document.createElement("time");
                timeNode.setAttribute("datetime", postItemFromList.date);
                var timeText = document.createTextNode("Date published: " + postItemFromList.date);
                timeNode.appendChild(timeText);
                postNode.appendChild(timeNode);
                postNode.setAttribute("id", "post-" + postItemFromList.name);
            }
            postContainer.appendChild(postNode);
        } else {
            console.err(err);
        }
    });

}

function receivePostList(response) {
    var data = response.responseText;
    postList = JSON.parse(data);
    postList.sort(function(a, b) {
        return Date.parse(b.date) - Date.parse(a.date);
    });
    var i;
    var postListElement = document.getElementById("postList");
    while(postListElement.firstChild) {
        postListElement.removeChild(postListElement.firstChild);
    }
    for(i=0; i<postList.length; i++) {
        var postListItem = document.createElement('li');
        var postLinkItem = document.createElement('a');
        postLinkItem.setAttribute("href", "http://" + siteRootURL + "/posts/" + postList[i].name);
        postLinkItem.addEventListener("click", (function(fileName){
            return function(evt) {
                evt.preventDefault();
                loadSinglePost(fileName);
            };
        })(postList[i].name));
        var postText = document.createTextNode(postList[i].name);
        postLinkItem.appendChild(postText);
        postListItem.appendChild(postLinkItem);
        postListElement.appendChild(postListItem);
    }
}

function postFilter(postText) {
    return postText.replace(/%current-domain/g, siteRootURL);
}

if(window.onload) {
    var oldLoader = window.onload;
    var newLoader = function() {
        oldLoader();
        initBlog();
    };
    window.onload = newLoader;
} else {
    window.onload = initBlog;
}
