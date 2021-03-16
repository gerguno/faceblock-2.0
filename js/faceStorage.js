'use strict';

angular.module('app').service('faceStorage', ['$timeout',
    function ($timeout) {
        const _this = this;
        this.data = [];
        this.switcher = true;
        this.alert = false;

        this.findAll = function(callback) {
            chrome.storage.sync.get('face', function(keys) {
                if (keys.face != null) {
                    _this.data = keys.face;
                    for (let i=0; i<_this.data.length; i++) {
                        _this.data[i]['id'] = i + 1;
                    }
                    console.log(_this.data);
                    callback(_this.data);
                }
            });
            this.addTracker();
        }

        this.sync = function() {
            chrome.storage.sync.set({face: this.data}, function() {
                console.log('Data is stored in Chrome storage');
            });
        }

        this.sendClean = function() {
            chrome.extension.sendMessage({
                type: "clean"
            });
        }

        this.add = function (newContent) {
            const id = this.data.length + 1,
                  nc = newContent.replace("#", '');
            const face = {
                id: id,
                content: nc,
                color: '#F7F8FB',
                counter: 0,
                trashesCounter: new Array(),
                createdAt: new Date()
            };

            if (newContent.length > 3) {
                this.alert = false;
                this.data.push(face);
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

        this.remove = function(face) {
            this.data.splice(this.data.indexOf(face), 1);
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
          const keyword =  'Keyword: ' + newContent;
          _gaq.push(['_trackEvent', keyword, 'clicked']);         
        }

        this.trackSwitcher = function() {
          _gaq.push(['_trackEvent', 'Switcher', 'clicked']);         
        }        

        this.trackButton = function(e) {
          _gaq.push(['_trackEvent', e.target.id, 'clicked']);
        };

        this.addTracker = function() {
            const buttons = document.querySelectorAll('a');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener('click', _this.trackButton, false);
            }
        }

        this.toTitleCase = function(str) {
            return str.replace(/[\wа-я]+\S*/ig, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        this.keys = function() {
            let keys = "";
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
            let amount = 0;
            if (this.data != null) {
                for (let i=0; i<_this.data.length; i++) {
                    amount += _this.data[i]['counter'];
                }
            }    
            return amount;            
        }

        this.linkFacebook = function() {
            let amount = this.amount(),
                keys = this.keys();

            if (amount !== 0) {
                let name          = "&name="        + "I blocked " + keys + " in my Newsfeed thanks to Faceblock";
                let description   = "&description=" +  amount + " post(s) about it were deleted. Now my Newsfeed is filled with the things I actually care about.";
            }   else {
                let name          = "&name="        + "I block posts about stuff I don't like in my Newsfeed thanks to Faceblock";
                let description   = "&description=" + "Now my Newsfeed is filled with the things I actually care about.";
            }

            let id       = "1654481754804604";
            let display  = "&display="     + "popup";
            let link     = "&link="        + "https://chrome.google.com/webstore/detail/faceblock/aljnhamaajogdndmfnedoodpoofadkph";
            let  picture  = "&picture="     + "https://raw.githubusercontent.com/gerguno/faceblock-2.0/master/promo/Faceblock-Share-2.png";
            let caption  = "&caption="     + "Faceblock";
            let fullLink = "https://www.facebook.com/dialog/feed?app_id=" + id + display + link + name + caption + description + picture + "&redirect_uri=https://www.facebook.com";
            window.open(fullLink, '_blank');
        }

        this.linkTwitter = function() {
            let amount = this.amount(),
                keys = this.keys();

            if (amount != 0) {
                let text          = "&text="    + "I blocked " + keys + " in my Facebook Newsfeed thanks to Faceblock. " + amount + " post(s) about it were deleted.";
            }   else {
                let text          = "&text="    + "I block posts about stuff I don't like in my Facebook Newsfeed thanks to Faceblock";
            }

            let link     = "https://chrome.google.com/webstore/detail/faceblock/aljnhamaajogdndmfnedoodpoofadkph";
            let via      = "&link="        + "@pitonpitonpiton";
            let fullLink = "https://twitter.com/intent/tweet?url=" + link + text + via;
            window.open(fullLink, '_blank');
        }

        //Update _this.data on chrome.storage change
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            $timeout(_this.findAll(function(face) {
                _this.data = face;
            }));
        });
}]);