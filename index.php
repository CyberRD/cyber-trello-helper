<html>
<head>
	<title>Cybersoft Trello Helper</title>
	<meta charset="utf-8"></meta>

	<link rel="stylesheet" href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
	<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.css">
	<link rel="stylesheet" type="text/css" href="css/main.css">
  
	<script src="https://code.jquery.com/jquery-1.7.1.min.js"></script>
	<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
	<script src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.js"></script>
	<script src="https://api.trello.com/1/client.js?key=[TRELLO_KEY]"></script>
	<script src="js/model.js"></script>
	<script src="js/autoWeight.js"></script>
	<script src="js/productivityLevel.js"></script>
	<script src="js/utils.js"></script>
</head>
<body>
	<header>
		<a href="index.php"><img src="images/title.png"></img></a>
	</header>
	<div id="message">
		<div class="messageContent">
			<img class="messageContent" src="images/gears.gif" />
		</div>
	</div>
	<div id="mainContent">
		<div id="boardSelect">
			<p>Choose a board:</pn>
			<select id="boards"></select>
		</div>
		<br><br>
		<div id="functionTabs">
			<ul>
		    	<li><a href="#newCardAdder">Add New Card</a></li>
		    	<li><a href="#productivityContent">Productivity</a></li>
		  	</ul>
			<div id="newCardAdder">
				<span>Choose a list:</span>
				<select id="lists"></select>
				<br>
				<span>Enter tags:</span>
				<input id="cardTag" placeholder="Enter card tag here. Ex:[SDD]" size=30></input>
				<br>
				<span>Enter cards' title, use newline as delimiter:</span>
				<br>
				<textarea id="cardTitles" rows=10 cols=20 placeholder="Enter card title here.Your input will be split line by line as card title."></textarea>
				<br>
				<button id="addCardsBtn" class="btn">Add Cards</button>
				<hr>
				<div id="message"></div>
			</div>
			
			<div id="productivityContent">
				<div id="btnGetProductivity">
					<button class="btn">Calculate</button>
				</div>
				<div id="iterationRange">
					From iteration <input id="iterationStart" value="42" size="10%"> to iteration <input id="iterationEnd" value="59" size="10%">
				</div>
				<div id="members" style="display: none"></div>
				<div id="productivityResult"></div>
			</div>
		</div>
	</div>
</body>
</html>