$(document).ready(function () {
    var numOfInputs = 1;
    //Add more input feilds to mash up more users when clicking button
    $("#add-username-field").click(function () {
        numOfInputs++;
        //Build html for new input field and button to remove field. Give them inique ids based on the numOfInputs value
        var inputId = "input-username-" + numOfInputs;
        var removeInputButtonId = "remove-input-" + numOfInputs;
        var newUsernameInput = "<input type='text' id='" + inputId + "' class='username form-control'>";
        var removeInputButton = "<button id='" + removeInputButtonId + "' class= 'btn btn-danger'>X</button>";

        //Append new text box input
        $('#username-inputs').append(newUsernameInput);
        //Append new button to remove textbox with a click handler to remove the textbox and itself
        //Referenced solution from this resource: http://stackoverflow.com/questions/1525664/jquery-how-to-bind-onclick-event-to-dynamically-added-html-element
        $('#username-inputs').append(function () {
            return $(removeInputButton).click(function () {
                //Gets rid of textbox and button to get rid of textbox and updates the count of textboxes
                $('#' + inputId).remove();
                $('#' + removeInputButtonId).remove();
                numOfInputs--;
            })
        });
    });

    //Click to generate Markov chaing
    $('#send-username').click(function () {
        var users = getUsersFromInputFields();
        //Train usernames and genrate promises
        var trainingPromises = trainAllUsernames(users);

        //Once all promises are resolved, then the Markov chain is generated and displayed
        Promise.all(trainingPromises).then(values => {
            console.log("All promises complete")
            generateMarkovFromTrainedData();
        });

    });

    //Sends calls to training api for multiple users
    function trainAllUsernames(users) {
        //Each call the training api creates a new promise which is appended to this array of promises. Only once all the training promises are resolved is the Markov chain generated
        var trainingPromises = [];

        for (user of users) {
            var trainUrl = "/api/tweets/train/" + user;
            console.log("Sent call to training endpoint at " + trainUrl);
            if (user) {
                $('#error').slideUp();
                trainingPromises.push(makeTrainingPromise(trainUrl));
            } else {
                $('#error').slideDown();
            }
        }
        return trainingPromises;
    }

    function getUsersFromInputFields() {
        //loop through all inputs with the class username and put their value into an array
        var users = [];
        $(".username").each(function () {
            users.push($(this).val());
        });
        return users;
    }

    function makeTrainingPromise(trainUrl) {
        //make a promise for a call to the training endpoint
        var trainingPromise = new Promise(resolve => {
            $.get(trainUrl, function (response) {
                console.log("Response: " + response);
                resolve(response);
            });
        });
        return trainingPromise;
    }

    function generateMarkovFromTrainedData() {
        //Call the generate endpoint to generate a markov chain and display response to UI
        var generateUrl = "/api/tweets/generate/";
        $.get(generateUrl, function (dataMarkovTweet) {
            //Display Markov Chain in html
            $("#markov-tweet").text(dataMarkovTweet);
        })
    }
});