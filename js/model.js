// 跟trello相關的一些參數
var trelloVars = {
	authenticationSuccess : function() { console.log("Successful authentication"); },
	authenticationFailure : function() { console.log("Failed authentication"); },
	creationSuccess : function(data) {
		console.log("Card created successfully. Data returned:" + JSON.stringify(data));
	},
	targetListId : "5627b134b435370d7bd1097a",
	defaultNewCard : {
		name: "New Test Card", 
		desc: "This is the description of our new card.", 
		pos: "top", 
		idList: null
	}
}

// 主要是當前資料以及一些字典
var currentData = {
	iterationListNamePattern: /Iteration-(\d+)/,
	boardId: null,
	lists: {},
	members: {}
}

// 每個member自己私有的data
var membersData = {};

var INVALID_OPTION = "-1";