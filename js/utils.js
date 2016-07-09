// Initialize trello api object
function initTrello(){
	var authenticationSuccess = trelloVars.authenticationSuccess;
	var authenticationFailure = trelloVars.authenticationFailure;
	Trello.authorize({
		type: "redirect",
		name: "Cybersoft SDD Milestone Helper",
		scope: {
			read: true,
			write: true },
		expiration: "30days",
		authenticationSuccess,
		authenticationFailure
	});
	trelloVars.defaultNewCard.idList = trelloVars.targetListId;
}

// Set lists to drop down list
function setListsToDropDownList(){
	getLists(function(lists){
		$("#lists option").remove();
		$("#lists").append($("<option></option>").attr("value", INVALID_OPTION).text("Choose a list..."));
		for(var i=0;i<lists.length;i++){
			$("#lists").append($("<option></option>").attr("value", lists[i].id).text(lists[i].name));
		}
	});
}

// Set boards to drop down list
function setBoardsToDropDownList(){
	getBoards(function(boards){
		$("#boards").append($("<option></option>").attr("value", INVALID_OPTION).text("Choose a board..."));
		for(var i=0;i<boards.length;i++){
			$("#boards").append($("<option></option>").attr("value", boards[i].id).text(boards[i].name));
		}
	});
}

// Routine of adding cards when button is clicked
function addCardRoutine(){
	if($("#boards").find(":selected").val()==INVALID_OPTION){
		alert("Please choose a board.");
		return;
	}
	if($("#lists").find(":selected").val()==INVALID_OPTION){
		alert("Please choose a list.");
		return;
	}
	var tag = $("#cardTag").val();
	var cardTitles = $("#cardTitles").val().split("\n");
	if(cardTitles[0]==""){ // TODO: Find a better way to detect empty input.
		return;
	}
	cardTitles.forEach(function(title){
		addNewCard(createNewCard(tag + title, "", "top", $("#lists").find(":selected").val()));
	});
}

// Add new card to a list via api
function addNewCard(newCard){
	var creationSuccess = trelloVars.creationSuccess;
	if(newCard==undefined){
		newCard = trelloVars.defaultNewCard;
	}
	console.log(newCard);
	Trello.post("/cards", newCard, function(){
		$("#message").append("Card " + newCard.name + " added successfully.<br>");
	});
}

// Simply add a new card
function createNewCard(name, description, pos, idList){
	// Set input params
	name = name || trelloVars.defaultNewCard.name;
	description = trelloVars.defaultNewCard.desc || "";
	pos = pos || trelloVars.defaultNewCard.pos;
	idList = idList || $("#lists").find(":selected").val();

	var newCard = {
		name: name, 
		desc: description, 
		pos: pos, 
		idList: idList
	};

	return newCard;
}

// Get all boards of current user, and trigger callback when success
function getBoards(successCallback){
	var target = "members/me/boards";
	Trello.get(target, successCallback);
}

// Get all lists of current board, and trigger callback when success
function getLists(successCallback){
	var target = "boards/" + currentData.boardId + "/lists";
	Trello.get(target, successCallback);
}

// Gel all members of current board, and trigger callback when success
function getMembers(successCallback){
	var target = "boards/" + currentData.boardId + "/members";
	Trello.get(target, successCallback);
}

// Get all cards of current board, and trigger callback when success
function getAllCards(successCallback){
	var target = "boards/" + currentData.boardId + "/cards";
	Trello.get(target, successCallback);
}

// Update all members' data and then update UI
function updateMemberData(cards){
	$.each(cards, function(idx, card){
		
		if(!isValidList(card.idList)){
			return;
		}

		var point = ExtractTaskPoint(card.name);
		var idMembers = card.idMembers;

		if(!jQuery.isNumeric(point)){
			alert("Invalid card title with \"" + value + "\" point.");
			return;
		}

		idMembers.forEach(function(id){
			membersData[id].totalProductivity += +point;
			console.log(card.name + "/point:" + point);
			console.log(membersData[id].fullName + ":" + membersData[id].totalProductivity)
		});
	});

	computeProductivity();	
	showMembersData();
	$("#message").hide();
}

// Compute avg productivity, level, threshold, rate and level
function computeProductivity(){
	var iterationNum = Math.abs($("#iterationEnd").val() - $("#iterationStart").val() + 1);
	
	// AvgProductivity
	$.each(membersData, function(idx, data){
		data.avgProductivity = data.totalProductivity / iterationNum;
	});

	var weightSum = 0;
	var pointSum = 0;

	$.each(membersData, function(idx, member){
		weightSum += member.isActive ? parseFloat(member.weight) : 0;
		pointSum += member.isActive ? parseFloat(member.totalProductivity) : 0;
	});

	$.each(membersData, function(idx, member){
		if(member.isActive){
			member.levelThreshold = pointSum * (member.weight / weightSum);			
			member.rate = member.levelThreshold==0 ? 0 : (member.totalProductivity / member.levelThreshold) * 100;
			member.level = computeLevel(member.rate);
		}
	});
}

// Compute productivity level
function computeLevel(rate){

	var distanceNum = Math.floor((rate - productivityLevel.basicLevelThreshold) / productivityLevel.distance);
	var levelIdx = productivityLevel.basicLevelIdx - distanceNum;

	if(levelIdx < 0){
		levelIdx = 0;
	}

	if(levelIdx >= productivityLevel.level.length)
	{
		levelIdx = productivityLevel.level.length - 1;
	}

	return productivityLevel.level[levelIdx];
}

// 檢查該list id是否有在目前要算的list之內 (From iteration XX to iteration XX)
function isValidList(listId){
	var iterationStart = $("#iterationStart").val();
	var iterationEnd = $("#iterationEnd").val();
	var listName = currentData.lists[listId];

	if(listName==""){
		return false;
	}

	if(currentData.iterationListNamePattern.test(listName)){
		var iterationId = RegExp.$1;
			
		if(iterationId >= iterationStart && iterationId <= iterationEnd){	
			return true;
		}
	}

	return false;
}

// Extract point of per card from card title
function ExtractTaskPoint(cardName)
{
	var pattern = /^\(.*\).*\[(.*)\]$/gi;
	if(!pattern.test(cardName))
	{
		console.log("ERROR!!!!!!!!" + cardName);
		return 0;
	}
	//console.log("Point:" + RegExp.$1);
	return RegExp.$1;
}

// Append member name, checkbox and weight
function updateMemberArea(members){
	$("#members").empty();
	$("#members").append("<h3>Members Setting<h3>");

	var table = $("<table>").addClass("memberSetting");
	var headerRow = $("<tr>");
	headerRow.append("<th>Name</th><th>Active</th><th>Weight</th>");
	table.append(headerRow);

	members.forEach(function(member){

		currentData.members[member.id] = member.fullName;	
		membersData[member.id] = {
			fullName: member.fullName,
			isActive: false
		};

		var tr = $("<tr>");
		tr.append("<td>" + member.fullName + "</td>");
		var td = $("<td>");
		var checkbox = $("<input />", { type: "checkbox", id: "isActive_" + member.id});
		td.append(checkbox);
		tr.append(td);
		td = $("<td>").addClass("weightColumn");
		$("<input />", { type: "text", width: "20%", id: "weight_" + member.id, value: getAutoWeight(member.fullName)}).appendTo(td);
		td.append("%");
		tr.append(td);
		
		table.append(tr);

		// Register checkbox event
		checkbox.click(
			{memberId: member.id}, 
			onActiveMemberCheckboxClicked);
	});

	console.log(currentData.members);
	console.log(membersData);
	$("#members").append(table);
	$("#members").slideDown();
}

// Callback when active member checkbox is clicked
function onActiveMemberCheckboxClicked(event){
	membersData[event.data.memberId].isActive = $("#isActive_" + event.data.memberId).prop("checked");
}

// Update member's weight from textbox
function updateWeight(){
	$.each(membersData, function(id, member){
		membersData[id].weight = $("#weight_" + id).val();
	});
}

// Get weight from autoWeight.js
function getAutoWeight(fullName){

	var weight = autoWeight[fullName];

	if(weight == undefined){
		console.log("Member" + fullName + "is not found in autoWeight.js!");
		weight = 100;
	}

	if(!jQuery.isNumeric(weight)){
		alert("Invalid weight: " + weight + "!");
		return;
	}

	return weight;
}

// Update currentData.lists for future reference
function updateCurrentList(lists){
	lists.forEach(function(list){
		currentData.lists[list.id] = list.name;
	});
	console.log(currentData.lists);
}

// Reset members data which is relative to productivity
function resetMembersProductivity(){
	$.each(membersData, function(idx, data){
		data.totalProductivity = 0;
		data.avgProductivity = 0;
		data.levelThreshold = 0;
		data.rate = 0;
		data.level = "";
	})
}

// Update UI for showing productivity
function showMembersData(){
	$("#productivityResult").empty();
	$("#productivityResult").append("<h3>Productivity</h3>");

	var dataSource = [];
	var dataHeader = getTableHeader();
	$.each(membersData, function(id, member){
		dataSource.push([
				member.fullName, 
				member.weight, 
				member.isActive, 
				member.totalProductivity, 
				member.avgProductivity, 
				member.levelThreshold, 
				member.rate, 
				member.level
			]);
	});

	var productivityTable = $("<table>").addClass("display");

	productivityTable.DataTable({
		"data": dataSource,
		"columns": dataHeader,
		"paging": false
	});

	$("#productivityResult").append(productivityTable);
}

// Generate table header for showing productivity
function getTableHeader(){

	var dataHeader = [
		{"title": "成員"},
		{"title": "產能權重"},
		{"title": "是否納入等級計算"},
		{"title": "總產能(points)"},
		{"title": "平均每iteration產能(points)"},
		{"title": "總應達產能(points)"},
		{"title": "達成率(%)"},
		{"title": "產能等級"}
	];

	return dataHeader;
}

$(document).ready(function(){
	initTrello();

	$("#functionTabs").tabs({
		show: { effect: "fadeIn", duration: 500 }
	});
	
	$("#boards").change(function(){
		$("#functionTabs").slideDown();
		currentData.boardId = $("#boards").find(":selected").val();
		setListsToDropDownList();
		getLists(updateCurrentList);
		getMembers(updateMemberArea);
	});

	setBoardsToDropDownList();
	$("#addCardsBtn").click(function(){
		addCardRoutine();
	})
	$("#btnGetProductivity").click(function(){
		$("#message").show();
		resetMembersProductivity();
		updateWeight();
		getAllCards(updateMemberData);
	});
});
