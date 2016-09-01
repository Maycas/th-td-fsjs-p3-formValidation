/****************************
GLOBAL VARIABLES
/***************************/

var $userName = $("#name"); // user name input field
var $email = $("#mail"); // email input field
var $jobRoleSelect = $("#title"); // job role select
var $otherTitleInput = $("#other-title"); // 'Other' job role input
var $designSelect = $("#design"); // Design select
var $colorSelect = $("#color"); // Color select
var colors; // Array to store the different color values 
var noDesign = [],
    jsPuns = [],
    heartJs = []; // Arrays of the different colors for the different patterns
var $activitiesCheckboxes = $("input[type='checkbox']"); // Activity checkboxes
var price = 0; // Total price
var $paymentMethodSelect = $("#payment"); // Payment select method();
var $creditCardForm = $("#credit-card"); // Credit Card Form
var $payPalMessage = $creditCardForm.next(); // PayPal message
var $bitCoinMessage = $payPalMessage.next(); // bitCoin message
var $submitButton = $("button[type='submit']"); // submit button


/****************************
FUNCTIONS
****************************/

// Initialization function
var init = function() {
    // Focus on the first element when page loads
    $userName.focus();

    // Job Role - Hide the otherTitle input field
    $otherTitleInput.hide();

    // Initialize the color select
    setupColorSelect();

    // Remove the color options from the dropdown and store them in different color variables
    // The reason behind this is explained in 'showColorOptions'
    colors = $colorSelect.children().remove();
    classifyColors();

    // Insert the price placeholder (empty at the beginning)
    $(".activities").append("<p class='price'></p>");

    // Hide all the payment options (the messages will be displayed as soon as the user selects an option)
    hideAllPaymentOptions();

    // Credit card form must be shown and selected by default
    $paymentMethodSelect.val("credit card");
    $creditCardForm.show();

    // Set up the different listeners to specific events
    registerListeners();
};

// Register the different event listeners to the elements
var registerListeners = function() {
    // Job role - When 'Other' is selected add an input field with other title
    $jobRoleSelect.change(setOtherInputField);

    // Color designs - Show only the options in the color select depending on the design selected
    $designSelect.change(showColorOptions);

    // Activities - Control the total price and the activity conflicts (concatenating 2 different handlers)
    $activitiesCheckboxes.click(calculatePrice).click(checkScheduleConflicts);

    // Payment - Manage the messages to show depending on the selected payment option
    $paymentMethodSelect.change(showPaymentInfo);

    // Submit - Check if the provided info is valid before submitting and provide feedback if there's missing info
    $submitButton.click(checkValidForm).click(displayErrorMessages);
};

// Setup the initial behavior of the color select menu
var setupColorSelect = function() {
    // Hide the colorSelect menu and the label at the beginning  
    $colorSelect.hide();
    $colorSelect.prev().hide(); // Hide the label

    // Add a new option requesting the user to select a design before selecting the color
    $colorSelect.children().first().before("<option value='none'>&lt;-- Please select a T-shirt Theme</option>");
    $colorSelect.val($colorSelect.children().first().val()); // Set this newly added option as selected
};


// Classifies colors in the different designs
var classifyColors = function() {
    for (var i = 0; i < colors.length; i++) {
        if ($(colors[i]).val() === "none") {
            noDesign = $(colors[i]);
        } else if ($(colors[i]).text().indexOf("JS Puns") > -1) {
            jsPuns.push($(colors[i]));
        } else {
            heartJs.push($(colors[i]));
        }
    }
};

// Function to show the 'Other role' input field in case 'Other' is selected
var setOtherInputField = function() {
    // If 'Other' is selected
    if ($(this).val() === "other") {
        $otherTitleInput.show();
    } else {
        $otherTitleInput.hide();
    }
};

// Shows the correct color options depending on the chosen design
var showColorOptions = function() {
    // Show the color label and the selector in case a design is selected and hide it otherwise
    if ($designSelect.val() !== "Select Theme") {
        $colorSelect.show();
        $colorSelect.prev().show(); // Show the label
    } else {
        $colorSelect.hide();
        $colorSelect.prev().hide(); // Hide the label
    }

    /*
        Found a limitation with Safari browser when hiding option items inside of a select. Even though the display:none is 
        applied correctly in the HTML, all options are still shown in Safari (and presumably in IE)
        This limitation is documented here: http://stackoverflow.com/questions/15025555/option-style-display-none-not-working-in-safari
        The workaround for this is removing and re-appending the nodes
    */
    // Remove all the color options
    $colorSelect.children().remove();

    if ($(this).val() === "js puns") {
        // Show the 3 options for js puns
        $colorSelect.append(jsPuns);
    } else if ($(this).val() === "heart js") {
        // Show the 3 options for heart js
        $colorSelect.append(heartJs);
    } else {
        // Show only the option to select a T-shirt
        $colorSelect.append(noDesign);
    }

    // Select the first children as the selected value
    $colorSelect.val($colorSelect.children().first().val());
};

// Calculates the total price of the activities selected
var calculatePrice = function() {
    var $activity = $(this);
    var activityText = $activity.parent().text();
    var activityPrice = parsePrice(activityText);

    if ($activity.prop("checked")) {
        // Add the price value if the activity has been checked
        price += activityPrice;
    } else {
        // Substract the price from the global if the activity has been unchecked
        price -= activityPrice;
    }

    // Set the value in the interface (price placeholder)
    $(".price").text("Total: $" + price);
};

// Parses the price int from the text string
var parsePrice = function(text) {
    var dollar = text.indexOf("$");
    return parseInt(text.substr(dollar + 1));
};

// Checks if there are conflicts between activities and deactivates or reactivates the selection
var checkScheduleConflicts = function() {
    var $activity = $(this);

    // Schedule conflicts to handle:
    // Javascript Frameworks Worskshop (name = js-frameworks) vs Express Workshop (name = express)
    resolveConflict($activity, "js-frameworks", "express");
    // Javascript Libraries (name = js-libs) vs Node.js Workshop (name = node)
    resolveConflict($activity, "js-libs", "node");
};

// Helper to compare conflicts between 2 activities
var resolveConflict = function($clickedActivity, activityName1, activityName2) {
    if ($clickedActivity.prop("name") === activityName1) {
        if ($clickedActivity.prop("checked")) {
            // Checked js-frameworks, then disable express
            $("input[type='checkbox'][name='" + activityName2 + "']").prop("disabled", true);
            $("input[type='checkbox'][name='" + activityName2 + "']").parent().css("color", "grey");
        } else {
            // Restore the initial configuration
            $("input[type='checkbox'][name='" + activityName2 + "']").prop("disabled", false);
            $("input[type='checkbox'][name='" + activityName2 + "']").parent().css("color", "initial");
        }
    } else if ($clickedActivity.prop("name") === activityName2) {
        if ($clickedActivity.prop("checked")) {
            // Checked js-frameworks, then disable express
            $("input[type='checkbox'][name='" + activityName1 + "']").prop("disabled", true);
            $("input[type='checkbox'][name='" + activityName1 + "']").parent().css("color", "grey");
        } else {
            // Restore the initial configuration
            $("input[type='checkbox'][name='" + activityName1 + "']").prop("disabled", false);
            $("input[type='checkbox'][name='" + activityName1 + "']").parent().css("color", "initial");
        }
    }
};

// Hides all the payment options
var hideAllPaymentOptions = function() {
    // Hide credit card form
    $creditCardForm.hide();

    // Hide PayPal message
    $payPalMessage.hide();

    // Hide the Bitcoins message
    $bitCoinMessage.hide();
};

// Shows the specific info depending on the selected payment option
var showPaymentInfo = function() {
    // Hide all the options in case there was one selected
    hideAllPaymentOptions();

    // Show the specific info depending on the selection
    switch ($(this).val()) {
        case "credit card":
            $creditCardForm.show();
            break;
        case "paypal":
            $payPalMessage.show();
            break;
        case "bitcoin":
            $bitCoinMessage.show();
            break;
        default:
            hideAllPaymentOptions();
            break;
    }
};

// Check if all the required fields are properly set up
var checkValidForm = function(event) {
    // Do not allow to send the form if it's not valid
    if (!(isNameValid() && isEmailValid() && isShirtSelected() && isActivityValid() && isPaymentValid())) {
        event.preventDefault();
    }
    // If everything is OK, then allow the form to be sent
};

// Check if the username is not empty
var isNameValid = function() {
    return $userName.val() !== "";
};

// Check if the email has a valid email structure (not if it's a real e-mail address)
var isEmailValid = function() {
    var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    return regex.test($email.val());
};

// Check if at least one activity has been checked
var isActivityValid = function() {
    //The best (and easiest) way to test if an activity has been checked is if the price is higher than 0
    if (price > 0) {
        return true;
    }
    return false;
};

// Check if one payment method has been selected and in case it is a credit card, validate its data
var isPaymentValid = function() {
    // At least one option different than the default one selected
    if ($paymentMethodSelect.val() !== "select_method") {
        // Check if it's a valid credit card
        if ($paymentMethodSelect.val() === "credit card") {
            if (isCreditCardValid()) {
                return true;
            }
            return false;
        }
        // If the payment mehod is not a credit card, then it's valid
        return true;
    }
    // No method has been selected
    return false;
};

// Checks the correctness of the introduced credit card info
var isCreditCardValid = function() {
    return isCCNumberValid() && isZipValid() && isCVVValid();
};

// Check if the credit card number is correct following the algorithm described in:
// http://www.freeformatter.com/credit-card-number-generator-validator.html#validate
var isCCNumberValid = function() {
    var ccNumber = $("#cc-num").val(); // Value introduced in the input
    var ccNumberInt = []; // Array to store the numbers 

    // Parse the ccNumber into an string (to ease manipulation)
    var ccNumberStr = ccNumber.split('');

    // Drop the last digit
    var lastDigit = parseInt(ccNumberStr.pop());

    // Reverse the ccNumberStr
    ccNumberStr = ccNumberStr.reverse();

    for (var i in ccNumberStr) {
        var currNumber = parseInt(ccNumberStr[i]);
        // Multiply digits in odd positions by 2 
        // Should take into account the 0 index in JS, so need to apply this to even positions in the array
        if (i % 2 === 0) {
            currNumber *= 2;
        }
        // Substract 9 to numbers over 9
        if (currNumber > 9) {
            currNumber -= 9;
        }
        ccNumberInt.push(currNumber);
    }

    // Add all the numbers in the array
    var sum = 0;
    for (var j in ccNumberInt) {
        sum += ccNumberInt[j];
    }

    return sum % 10 === lastDigit;
};

// Check if the zip number is not empty or if it's a number
var isZipValid = function() {
    return $("#zip").val() !== "" && !isNaN($("#zip").val());
};

//Check if the CVV is 3 numbers long
var isCVVValid = function() {
    return $("#cvv").val().length === 3 && !isNaN($("#cvv").val());
};

// Check if the user selected a Design and a Color
var isShirtSelected = function() {
    return $designSelect.val() !== "Select Theme" && $colorSelect.val() !== "none";
};

// Checks if a payment option has been selected
var isPaymentOptionSelected = function() {
    return $("#payment").val() !== "select_method";
};

// Set error messages depending on the specific issue
var displayErrorMessages = function() {
    // Reset the labels in case the user has added new information
    resetLabels();

    // Check errors and change color and labels
    // Name field not valid
    if (!isNameValid()) {
        $userName.prev().text("Name: (please provide your name)");
        $userName.prev().css("color", "red");
    }

    // Email not valid
    if (!isEmailValid()) {
        $email.prev().text("Email: (please provide a valid email address)");
        $email.prev().css("color", "red");
    }

    // Add a reminder to select a T-shirt
    if (!isShirtSelected()) {
        // Add a message
        $(".shirt legend").append("<label class='shirt_message'>Don\'t forget to pick a T-shirt</label>");
        $(".shirt_message").css({
            "color": "red",
            "font-weight": "initial",
            "font-size": "initial",
            "margin-top": "5px"
        });
    }

    // Activity not selected
    if (!isActivityValid()) {
        // Add a message
        $(".activities legend").append("<label class='activities_message'>Please select an activity</label>");
        $(".activities_message").css({
            "color": "red",
            "font-weight": "initial",
            "font-size": "initial",
            "margin-top": "5px"
        });
    }

    // Payment validations
    if (!isPaymentOptionSelected()) {
        // Add a message
        $("label[for='payment']").prev().append("<label class='payment_message'>Please select a payment option</label>");
        $(".payment_message").css({
            "color": "red",
            "font-weight": "initial",
            "font-size": "initial",
            "margin-top": "5px"
        });
    } else if ($("#payment").val() === "credit card" && !isCreditCardValid()) {
        // Check if it comes from the card number
        if (!isCCNumberValid()) {
            $("#cc-num").prev().css("color", "red");
        }

        // Or the zip number
        if (!isZipValid()) {
            $("#zip").prev().css("color", "red");
        }

        // Or the CVV
        if (!isCVVValid()) {
            $("#cvv").prev().css("color", "red");
        }
    }
};

// Reset the labels to the original values and styles
var resetLabels = function() {
    // Reset user name labels
    $userName.prev().text("Name:");
    $userName.prev().css("color", "initial");

    // Reset e-mail labels
    $email.prev().text("Email:");
    $email.prev().css("color", "initial");

    // Remove the T-shirt message class from the page in case it was there
    if ($(".shirt_message").length > 0) {
        $(".shirt_message").remove();
    }

    // Remove the not selected activity message from the page in case it was there
    if ($(".activities_message").length > 0) {
        $(".activities_message").remove();
    }

    // Remove the payment message in case it was there
    if ($(".payment_message").length > 0) {
        $(".payment_message").remove();
    }

    // Reset the colors of the credit card labels
    $("#cc-num").prev().css("color", "initial");
    $("#zip").prev().css("color", "initial");
    $("#cvv").prev().css("color", "initial");
};


/****************************
APP FLOW
****************************/

init();