(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    
    function onDeviceReady() {
		var androidVer = device.version,
			androidVerInt = parseInt(androidVer, 10);
		
		console.log("Android version: " + androidVer);		
		if(androidVerInt >= 4) {
			// Do something here, maybe
		} else {
			$("#btnMyClasses").hide();
		}
		
		console.log("Cordova is ready!");
		navigator.splashscreen.hide();
		
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
		
		$(".btnURL").on("click", function() { getURL($(this)) });
		function getURL(theURL) { 
			navigator.vibrate(250);
			cordova.InAppBrowser.open(theURL.data("url"), "_blank", "location=yes");
		}

		$("#btnName").on("click", function() { getName() });
		function getName() {
			localStorage.userName = prompt("What's your name?");
			console.log(localStorage.userName);
			if((localStorage.userName == "") || (localStorage.userName == "null") || (localStorage.userName == undefined)) {
				// Nothing
				console.log("localStorage is currently: " + localStorage.userName);
				alert("Please a valid name!");
			} else {
				$(".welcomeMessage").html(" " + localStorage.userName.replace(/[^a-zA-Z]/g, ''));
			}
		}
		function loadName() {
			if((localStorage.userName == "") || (localStorage.userName == null) || (localStorage.userName == undefined)) {
				// Nothing
				console.log("localStorage is currently: " + localStorage.userName);
			} else {
				$(".welcomeMessage").html(" " + localStorage.userName);
			}
		}
		loadName();
		
		var db = new PouchDB("sdceClasses");
			$("#btnAddClass").on("click", function() { addClasses() });
			function addClasses() {
				var classCRN = $("#crnField").val(),
					className = $("#classField").val(),
					classInst = $("#instField").val();
					console.log(classCRN);
					console.log(className);
					console.log(classInst);
					var aClass = {
						"_id" : classCRN,
						"title" : className,
						"inst" : classInst
					}
					console.log(aClass);
					db.put(aClass, function callback(error, result) { 
						if(!error) {
							$("#divResults").html("Class saved!");
							console.log(result);
							clearFields();
						} else {
							$("#divResults").html(error.message);
							console.log(error);
						}
					});
			} // END addClasses()
			function clearFields() {
				document.getElementById("formClass").reset();
			} // END clearFields()
			$("#btnShowClass").on("click", function() { showClasses() });
			function showClasses() {
				db.allDocs({"include_docs" : true, "ascending" : true}, function callback(error, result) { 
					console.log(result);
					showTableOfClasses(result.rows);
				});
			} // END showClasses()
			function showTableOfClasses(result) {
				var $div = $("#divResults"),
					str = "<table border='1' id='classTable'>";
					str += "<tr><th>CRN</th><th>Class</th><th>Instructor</th><th>&nbsp;</th></tr>";
					for(var i = 0; i < result.length; i++) {
						str += "<tr><td>" + result[i].id + 
						"</td><td>" + result[i].doc.title +
						"</td><td>" + result[i].doc.inst +
						"</td><td>" + "<a href='#' class='ui-btn ui-mini ui-icon-edit ui-btn-icon-notext ui-corner-all'>Edit</a>" +
						"</td></tr>";
					}
					str += "</table>";
					str += "<hr>";
					str += "<input type='text' placeholder='2381H' id='deleteCRN'><button id='btnDelete'>Delete Class</button>";
					str += "<hr>";
					str += "<div class='divTwoCol'><div class='divLeftCol'><button id='btnUpdate'>Update</button></div><div class='divRightCol'><input type='text' placeholder='8833J' id='updateCRN'><input type='text' placeholder='Class Name' id='updateTitle'><input type='text' placeholder='Smith' id='updateInst'></div></div>";
					$div.html(str);
			} // END showTableOfClasses()
			$("body").on("click", "#btnDelete", function() { deleteClass() });
			function deleteClass() {
				var $theClass = $("#deleteCRN").val();
				db.get($theClass, function callback(error, result) {
					db.remove(result, function callback(error, result) {
						if(result) {
							console.log(result);
							showClasses();
						} else {
							console.log(error);
							alert("The CRN" + $theClass + " doesn't exist. Try again!");
							$("#deleteCRN").val("");
						}
					});
				});
			} // END deleteClass()
			$("#divResults").on("click", "tr", function() { deleteClassPrep($(this)) });
			function deleteClassPrep(thisObj) {
				var $editCRN = thisObj.find("td:eq(0)").text(),
					$editTitle = thisObj.find("td:eq(1)").text(),
					$editInst = thisObj.find("td:eq(2)").text();
				$("#updateCRN").val($editCRN);
				$("#updateTitle").val($editTitle);
				$("#updateInst").val($editInst);
			} // END deleteClassPrep()
			$("body").on("click", "#btnUpdate", function() { updateClass() });
			function updateClass() {
				var $theCRN = $("#updateCRN").val(),
					$theTitle = $("#updateTitle").val(),
					$theInst = $("#updateInst").val();
				db.get($theCRN, function callback(error, result) {
					if(error) {
						$("#updateCRN").val("");
						$("#updateTitle").val("");
						$("#updateInst").val("");
						alert("The class CRN" + $theCRN + " does not exist. Try again!");
					} else {
						db.put({
							"_id" : $theCRN,
							"title" : $theTitle,
							"inst" : $theInst,
							"_rev" : result._rev
						}, function callback(error, result) { showClasses() });
					}
				});
			} // END updateClass()
			$("#btnEmail").on("click", function() { emailUs() });
			function emailUs() {
				window.plugins.socialsharing.shareViaEmail(
					"Question about your app:<br>", // Message (body of the email)
					"mySDCE Feedback", // Subject
					['victor campos@live.com'], // To: Field - MUST be an array  ['']
					null, // CC: Field - MUST be an array  ['']
					null, // Bcc: Field - MUST be an array  ['']
					"www/images/programs.jpg", // Files (Attachments) - Local or external
					function(results) { console.log("Success:" + results) },
					function(error) { console.log("Fail: " + error) }
				);
			} // END emailUs()
			$("#btnShare").on("click", function() { shareApp() });
			function shareApp() {
				window.plugins.socialsharing.share(
					"Check out the mySDCE app!",		// Message
					"mySDCE App Download",				// Subject
					["www/images/ce-logo-vert.png"],	// Document (JPG, PNG, PDF) - Must be an [array]
					"http://amzn.com/B01EML3HP2",		// Link
					function(results) { console.log("Success:" + results) },	// Success
					function(error) { console.log("Fail: " + error) }			// Fail
				);
			} // END shareApp()
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();
/*
*	Project Author: Victor Campos <vcampos@swccd.edu>
*	Project Name:	mySDCE
*	Version:		1.20160426
*	Date:			2016-04-26
*	Description:	The Unofficial SDCE app
*/