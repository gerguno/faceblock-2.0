angular.module('app').service('todoStorage', ['$timeout',
    function ($timeout) {
        var _this = this;
        this.data = [];
        this.switcher = true;
        this.alert = false;

        this.findAll = function(callback) {
            chrome.storage.sync.get('todo', function(keys) {
                if (keys.todo != null) {
                    _this.data = keys.todo;
                    for (var i=0; i<_this.data.length; i++) {
                        _this.data[i]['id'] = i + 1;
                    }
                    console.log(_this.data);
                    callback(_this.data);
                }
            });
            this.addTracker();
        }

        this.sync = function() {
            chrome.storage.sync.set({todo: this.data}, function() {
                console.log('Data is stored in Chrome storage');
            });
        }

        this.sendClean = function() {
            chrome.extension.sendMessage({
                type: "clean"
            });
        }

        this.add = function (newContent) {
            var id = this.data.length + 1,
                newContent = newContent.replace("#", '');
            var todo = {
                id: id,
                content: newContent,
                color: '#F7F8FB',
                hinted: false,
                counter: 0,
                trashesCounter: new Array(),
                createdAt: new Date()
            };

            if (newContent.length > 3) {
                this.alert = false;
                this.data.push(todo);
                this.sync();
                this.sendClean();
                this.trackAdd(newContent);
            } else {
                this.alert = true;
            }
        }

        this.closeAlert = function() {
            this.alert = false;
            this.addTracker();
        }

        this.remove = function(todo) {
            this.data.splice(this.data.indexOf(todo), 1);
            this.sync();
            this.addTracker();
        }

        this.syncSwitcher = function() {
            chrome.storage.sync.set({switcher: this.switcher}, function() {
                console.log('Data is stored in Chrome storage');
            });        
        }

        this.findSwitcher = function(callback) {
            chrome.storage.sync.get('switcher', function(keys) {  
                if (keys.switcher != null) {
                    _this.switcher = keys.switcher;
                } else {
                    _this.switcher = true;
                    _this.syncSwitcher();
                }
                callback(_this.switcher);
            });      
        }

        this.sendSwitcher = function() {
            chrome.extension.sendMessage({
                type: "switcher-toggle"
            });
        }

        this.toggleSwitcher = function() {
            if (_this.switcher) {
                _this.switcher = false;
            } else { 
                _this.switcher = true; 
            }
            this.sendSwitcher();
            this.syncSwitcher();
            this.trackSwitcher();
        } 

        this.addCounter = function(id, counter) {
            this.data[id]['counter'] += counter;
            this.sync();
        }

        this.trackAdd = function(newContent) {
          var keyword =  'Keyword: ' + newContent;
          _gaq.push(['_trackEvent', keyword, 'clicked']);         
        }

        this.trackSwitcher = function() {
          _gaq.push(['_trackEvent', 'Switcher', 'clicked']);         
        }        

        this.trackButton = function(e) {
          _gaq.push(['_trackEvent', e.target.id, 'clicked']);
          console.log('send');
        };

        this.addTracker = function() {
            var buttons = document.querySelectorAll('a');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener('click', _this.trackButton, false);
            }
        }

        this.toTitleCase = function(str) {
            return str.replace(/[\wа-я]+\S*/ig, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        this.keys = function() {
            var keys = "";
            if (this.data != null) {
                if (_this.data.length > 0) {
                    if (_this.data.length > 1) {
                        if (_this.data.length > 2) {  
                            keys = this.toTitleCase(_this.data[0]['content']) + ", " + this.toTitleCase(_this.data[1]['content']) + " and " + this.toTitleCase(_this.data[2]['content']);
                        } else {
                            keys = this.toTitleCase(_this.data[0]['content']) + " and " + this.toTitleCase(_this.data[1]['content']);
                        }
                    } else {
                        keys = this.toTitleCase(_this.data[0]['content']);
                    }
                } 
            }    
            return keys;            
        }

        this.amount = function() {
            var amount = 0;
            if (this.data != null) {
                for (var i=0; i<_this.data.length; i++) {
                    amount += _this.data[i]['counter'];
                }
            }    
            return amount;            
        }

        this.linkFacebook = function() {
            var amount = this.amount(),
                keys = this.keys();

            if (amount != 0) {
                name          = "&name="        + "I blocked " + keys + " in my Newsfeed thanks to Faceblock";
                description   = "&description=" +  amount + " post(s) about it were deleted. Now my Newsfeed is filled with the things I actually care about.";
            }   else {
                name          = "&name="        + "I block posts about stuff I don't like in my Newsfeed thanks to Faceblock";
                description   = "&description=" + "Now my Newsfeed is filled with the things I actually care about.";
            } 

            id       = "1654481754804604";
            link     = "&link="        + "https://chrome.google.com/webstore/detail/faceblock/aljnhamaajogdndmfnedoodpoofadkph";
            picture  = "&picture="     + "/Faceblock-Share.png";
            caption  = "&caption="     + "Faceblock";
            fullLink = "https://www.facebook.com/dialog/feed?app_id=" + id + link + name + caption + description + picture + "&redirect_uri=https://www.facebook.com";
            window.open(fullLink, '_blank');
        }

        this.linkTwitter = function() {
            var amount = this.amount(),
                keys = this.keys();

            if (amount != 0) {
                text          = "&text="    + "I blocked " + keys + " in my Facebook Newsfeed thanks to Faceblock. " + amount + " post(s) about it were deleted.";
            }   else {
                text          = "&text="    + "I block posts about stuff I don't like in my Facebook Newsfeed thanks to Faceblock";
            } 

            link     = "https://chrome.google.com/webstore/detail/faceblock/aljnhamaajogdndmfnedoodpoofadkph";
            via      = "&link="        + "@pitonpitonpiton";
            fullLink = "https://twitter.com/intent/tweet?url=" + link + text + via;
            window.open(fullLink, '_blank');
        }

        // update this.data on chrome.storage change (counter change)
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            $timeout(_this.findAll(function(todo) {
                _this.data = todo;

                /* Hinted CSS Class Add*/                
                if (_this.switcher) {
                    function removeHinted(i) {
                        setTimeout(function() {
                            selected.className = originalClasses;
                        }, 1000);
                    }
                    for (var i=0; i<_this.data.length; i++) {
                        if (_this.data[i]['hinted'] == true) {
                            selected = document.querySelector('#values').children[i];
                            originalClasses = selected.className;
                            selected.className = originalClasses + " hinted";
                            removeHinted(i);
                        }
                    }
                }    
            }));
        }); 


}]);




//отримати і записувати дані: через this.data[i]['id'], this.data[i]['counter'].
//синхронізувати 