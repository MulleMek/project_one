"use strict";
var EM = (function($) {

	var SUBS = [];

	function _subscribe(events, callback) {
		SUBS.push(events);
		return $.subscribe(events, callback);
	}

	function _subscribeOnce(events, callback) {
		$.subscribe(events, function(){
			console.log("unsubscribed");
			$.unsubscribe(events);
			return _removeFromSUBS(events);
		});

		return _subscribe(events, callback);
	}

	function _pub(events, data) {

		if ( !arguments[0] || typeof arguments[0] !== "string" ) {
			throw "Invalid first argument in pub - " + JSON.stringify(argument[0]); 
		}

		return $.publish(arguments[0], arguments[1]);
	}

	function getSubs() {
		var _answer = [];

		SUBS.forEach(function(element){
			if ( typeof element !== "undefined" ) {
				_answer[_answer.length] = element;
			}
		});

		return _answer;
	}

	function _unsubscribe(events) {
		if ( !arguments[0] || typeof arguments[0] !== "string" ) {
			throw "Invalid first argument in unsubscribe - " + JSON.stringify(argument[0]); 
		}	

		var _index = SUBS.indexOf(events);

		if ( _index == -1 ) {
			console.error("Can't unsubscribe event that has not been subscribed - " + events);
			return;
		}

		_removeFromSUBS(events);

		return $.unsubscribe(events);
	}

	function _isSubscribed(event) {
		var _index = SUBS.indexOf(event);

		if ( _index == -1 ) {
			return false;
		}

		return true;
	}

	/*******************************/
	// SYSTEM 
	/*******************************/

	function _removeFromSUBS(eventName) {
		var _index = SUBS.indexOf(eventName);
		delete SUBS[_index];
	}

	return {
		pub: _pub,
		sub: _subscribe,
		subOnce: _subscribeOnce,
		unsub: _unsubscribe,
		getSubscribedEvents: getSubs,
		isSubscribed: _isSubscribed
	};

}) ($);