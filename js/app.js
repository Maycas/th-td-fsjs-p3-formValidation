/****************************
GLOBAL VARIABLES
/***************************/

var $userName = $("#name"); // user name input field
var $jobRoleSelect = $("#title"); // job role select
var $otherTitleInput = $('<input type="text" id="other-title" name="user_other_job_title" placeholder="Your Title">'); // 'Other' job role input
var $designSelect = $("#design");
var $colorSelect = $("#color");

/****************************
FUNCTIONS
****************************/

// Initialization function
var init = function() {
    // Focus on the first element when page loads
    $userName.focus();

    // T-shirt colors - Add a new option requesting the user to select a design before selecting the color and hide all the others
    $colorSelect.children().hide();
    $colorSelect.children().first().before("<option value='none'>&lt;-- Please select a T-shirt Theme</option>");
    $colorSelect.val($colorSelect.children().first().val()); // Set this newly added option as selected

    // Set up the different listeners to specific events
    registerListeners();
};

var registerListeners = function() {
    // Job role - When 'Other' is selected add an input field with other title
    $jobRoleSelect.change(setOtherInputField);

    // Color designs - Show only the options in the color select depending on the design selected
    $designSelect.change(showColorOptions);
};

// Function to set an extra input field below the job role select in case 'Other' is chosen
var setOtherInputField = function() {
    // If 'Other' is selected
    if ($(this).val() === "other") {
        // Insert after the select the $otherInput element
        $jobRoleSelect.after($otherTitleInput);
    } else {
        // Remove the $otherInput element if another option has been selected and this element is existing on the page
        if ($("#other-title")) {
            $otherTitleInput.remove();
        }
    }
};

// Shows the correct color options depending on the chosen design
var showColorOptions = function() {
    var punsColors = ["cornflowerblue", "darkslategrey", "gold"];
    var heartColors = ["tomato", "steelblue", "dimgrey"];

    // Hide all the options
    $colorSelect.children().hide();

    /*
        Found a limitation with Safari browser when hiding option items inside of a select:
            The code below works for Chrome and Firefox, for Safari (and apparently IE), even though the 
            display:none is applied correctly in the HTML, all options are still shown
        This limitation is documented here: http://stackoverflow.com/questions/15025555/option-style-display-none-not-working-in-safari
        The workaround for this is removing and re-appending the nodes (not applied on this version)
    */
    // TODO: Solve limitation in Safari web browsers
    if ($(this).val() === "js puns") {
        // Show the 3 options for js puns
        for (var i = 0; i < punsColors.length; i++) {
            $('option[value=' + punsColors[i] + ']').show();
        }
    } else if ($(this).val() === "heart js") {
        // Show the 3 options for heart js
        for (var j = 0; j < heartColors.length; j++) {
            $('option[value=' + heartColors[i] + ']').show();
        }
    } else {
        // Show only the option to select a T-shirt
        $("option[value='none']").show();
    }

    // Set the first visible children as the selected value
    /* 
        Found a jquery limitation when using webkit:
            The selector $colorSelect.find(":visible:first").val() doesn't return a value
        The approach below works for all browsers
    */
    $colorSelect.children().each(function() {
        if ($(this).css("display") !== "none") {
            $colorSelect.val($(this).val());
            // Break the loop
            return false;
        }
    });
};

/****************************
APP FLOW
****************************/

init();