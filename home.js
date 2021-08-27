var globalUname;
var globalMsgRef = firebase.database().ref('sampleRef/');

// function to log out from id
function logout() {
    firebase.auth().signOut().catch(function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorMessage);
    });
}

// unique username function
function checkUnameCreated() {
    // we need to give time otherwise it will move to next page or for writing in DB
    setTimeout(20);
    var newUname;
    let userId = firebase.auth().currentUser.uid;
    // firstly cheking if user has default username ie 'not'
    firebase.database().ref('users/' + userId).once('value', function (data) {
        if (data.val().uname == 'not') {
            // user has default username
            // unique username process starts
            newUname = prompt('enter a unique user-name');

            // checking username is unique or not
            firebase.database().ref('unames/' + newUname + '/uname').once('value', function (data) {
                if (data.val() == newUname) {
                    // username is not unique
                    // asking for new username
                    alert(`${newUname} already taken\nplease make any other user-name`);
                    // function calling itself to take new user name
                    checkUnameCreated();
                }
                else {
                    // got unique username so sending data to create username 
                    createData(newUname);
                }
            });
        }
        else {
            // setting globalUname with current user's uname for future uses-----
            globalUname = data.val().uname;
            console.log('global uname = ' + globalUname);

            // calling fuction that checks for new requests-----
            checkRequests();
        }
    });
}
function createData(newUname) {
    // creating unique username node
    let userId = firebase.auth().currentUser.uid;
    var firstName, lastName, DOB;

    firebase.database().ref('users/' + userId).on('value', (data) => {
        // gathering other shareble details-----
        firstName = data.val().fname;
        lastName = data.val().lname;
        DOB = data.val().dob;

        // setting uname and sharable details-----
        firebase.database().ref('unames/' + newUname).set({
            uname: newUname,
            fname: firstName,
            lname: lastName,
            dob: DOB,
            'profileImageUrl':'https://firebasestorage.googleapis.com/v0/b/webchat-5c2e5.appspot.com/o/defaultImage%2FProfilePicture?alt=media&token=5e923250-5d35-4abc-b70f-2565df5a09ac'
        }).then(() => {
            // updating uname into users profile
            let newData = {
                'uname': newUname
            };
            firebase.database().ref('users/').child(userId).update(newData);
        });
    });
}


// function called on clicking search button to find user
function searchUser() {
    let srchUsr = document.querySelector('#search-user').value;
    document.querySelector('#search-user').value = '';
    if (srchUsr !== '') {
        firebase.database().ref('unames/').once('value', (rawData) => {
            var found = 0;
            let temp;
            rawData.forEach(function (data) {
                document.querySelector('.contact').innerHTML = '';
                if (data.val().uname === srchUsr && srchUsr !== globalUname) {
                    found++;
                    temp = `<div class="userFound" onclick="addAsFriend('${srchUsr}')">${srchUsr}</div>`;
                }
            });
            if (found == 0) {
                temp = `<div class="userNotFound">no such user present</div>`;
                let x = setInterval(() => {
                    document.querySelector('.contact').innerHTML = '';
                    clearInterval(x);
                    showFriends();
                }, 2000);
            }
            document.querySelector('.contact').insertAdjacentHTML("afterbegin", temp);
        });
    }
}
// adding a friend
function addAsFriend(srchUsr) {
    let userId = firebase.auth().currentUser.uid;

    // creating name for common node to hold messages
    let common = globalUname.concat(srchUsr);

    // adding as a friend and prioviding common node of messages
    firebase.database().ref('users/' + userId + '/friends/' + srchUsr).set({
        'friend': srchUsr,
        'commonChat': common
    });

    // sending freind request and common chat id-----
    firebase.database().ref('requests/' + srchUsr + '/' + globalUname).set({
        'uname': globalUname,
        'commonChat': common
    });
    document.querySelector('.contact').innerHTML = '';
    setTimeout(() => {
        showFriends();
    }, 100);
}
// for enter button pressed while searching-----
document.querySelector('#search-user').addEventListener('keydown', (e) => {
    if (e.keyCode == 13) {
        searchUser();
    }
});


// checking if got new message from new friend or new request i.e. getting new commonChat node
function checkRequests() {
    // getting current user's uid-----
    let userId = firebase.auth().currentUser.uid;

    // taking reference of location that may hold the request-----
    let requestReference = firebase.database().ref('requests/' + globalUname);

    // reading data of request location-----
    requestReference.on('child_added', (data) => {
        // rquest has sender's uname and commonChat location-----
        friendUname = data.val().uname;
        freindCommonChat = data.val().commonChat;

        // adding friend request sender as a friend-----
        firebase.database().ref('users/' + userId + '/friends/' + friendUname).set({
            'friend': friendUname,
            'commonChat': freindCommonChat
        }).then(() => {
            // once the friend request sender has been added as a friend then removing request node-----
            requestReference.remove();
        });
    });
}

// for showing friends
function showFriends() {
    // getting current user's uid
    let userId = firebase.auth().currentUser.uid;

    // checking for friends-----
    firebase.database().ref('users/' + userId + '/friends/').on('child_added', function (data) {

        // creating html to show friend-----
        temp = `<div class="alreadyFriend" onclick="showChat('${data.val().friend}','${data.val().commonChat}')">${data.val().friend}</div>`;

        // inserting html of friend----
        document.querySelector('.contact').insertAdjacentHTML("afterbegin", temp);
    });
}


// it is called when we click on any friend-----
function showChat(chatId, commonChat) {
    // showing data in userinfo-----
    firebase.database().ref('unames/' + chatId).on('value', (data) => {
        document.querySelector('.image-div').style.backgroundImage = `url(${data.val().profileImageUrl})`;
        let name = data.val().fname + ' ' + data.val().lname;
        document.querySelector('.reciever-name').innerHTML = name;
        document.querySelector('.reciever-uname').innerHTML = data.val().uname
        document.querySelector('.reciever-dob').innerHTML = data.val().dob;
    });
    // clearing chat section-----
    document.querySelector('.msgs-area').innerHTML = '';

    //setting name with which we are currently chatting-----
    document.querySelector('.chat-name').innerHTML = chatId;

    // switiching off previous connections or references-----
    globalMsgRef.off();

    // seeting reference for commonChat node-----
    globalMsgRef = firebase.database().ref('messages/' + commonChat);

    globalMsgRef.on('child_added', (data) => {
        // taking value of data object in a variable-----
        let x = data.val();

        // don't want to read values of key with name 'LastSeen'-----
        if (data.key === 'LastSeen') { }
        else {

            // checking who sent the message-----
            if (globalUname == x.uname) {

                globalMsgRef.child('LastSeen').child(chatId).once('value', (data) => {
                    let tickColor = '';
                    // checking if LastSeen>chatId exists or not
                    // wherther lastseen time of reciever exists or not-----
                    if (data.exists()) {
                        // it means that user has ever opened the chat

                        if (data.val().lastseen >= x.time) {
                            // it means that user is online and has current reference opened
                            tickColor = 'blue';
                        }
                        else {
                            // user is not online-----
                            tickColor = 'grey';
                        }
                    }
                    else {
                        // it means user has never opened the chat, just added us as a friend-----
                        tickColor = 'grey';
                    }
                    showMessages(x.msg, true, tickColor);
                });
            }
            else {
                // for message received-----
                let tickColor = ''
                showMessages(x.msg, false, tickColor);
            }
        }
    });

    // opening chat window for first time and getting first message from sender, so creating node-----
    // it will run only once-----
    globalMsgRef.child('LastSeen').child(chatId).on('child_added', () => {
        var items = document.querySelectorAll('.tick');
        for (let i = 0; i < items.length; i++) {
            document.querySelectorAll('.tick')[i].style.borderColor = 'blue';
        }
    });

    // when chat has been done before too, so updating timestamp coz----
    globalMsgRef.child('LastSeen').child(chatId).on('child_changed', () => {
        var items = document.querySelectorAll('.tick');
        for (let i = 0; i < items.length; i++) {
            document.querySelectorAll('.tick')[i].style.borderColor = 'blue';
        }
    });
}
// displays messages
function showMessages(msg, sender, tickColor) {
    // creating html for message sent by us-----
    let sentMessage = `<div class="container">
                    <div class="rec"  style="visibility: hidden">
                        <p id="rec-msg"></p>
                    </div>
                    <div class="send">
                        <p id="send-msg">${msg}</p>
                        <i class='tick' style="border-color:${tickColor};"></i>
                    </div>
                </div>`

    // creating html for receinved message-----
    let receivedMessage = `<div class="container">
                    <div class="rec">
                        <p id="rec-msg">${msg}</p>
                    </div>
                    <div class="send"  style="visibility: hidden">
                        <p id="send-msg">bey</p>
                        <i class='tick'></i>
                    </div>
                </div>`

    // inserting messages as html-----
    if (sender) {
        // insertion of sender's message----
        document.querySelector('.msgs-area').insertAdjacentHTML("beforeend", sentMessage);
    }
    else {
        // insertion of receiver's message----
        document.querySelector('.msgs-area').insertAdjacentHTML("beforeend", receivedMessage);

        // updating last seen of user-----
        let newTime = {
            lastseen: firebase.database.ServerValue.TIMESTAMP
        }
        globalMsgRef.child('LastSeen/' + globalUname).update(newTime);
    }

    // scrolling to last-----
    document.querySelector('.msgs-area').scrollTo(0, document.querySelector('.msgs-area').scrollHeight);
}


// function called on clicking send button
function sendMessage() {
    let msgField = document.querySelector('#msg-field');
    let receiver = document.querySelector('.chat-name').innerHTML;
    let userId = firebase.auth().currentUser.uid;
    let commonChat;
    msg = msgField.value;
    if (msg && receiver !== '') {
        msgField.value = '';
        firebase.database().ref('users/' + userId + '/friends/' + receiver).once('value', (data) => {
            commonChat = data.val().commonChat;
        }).then(() => {
            firebase.database().ref('messages/' + commonChat).push().set({
                'uname': globalUname,
                'msg': msg,
                'time': firebase.database.ServerValue.TIMESTAMP
            });
        });
    }
}
// for enter button pressed while sending message-----
document.querySelector('#msg-field').addEventListener('keydown', (e) => {
    if (e.keyCode == 13) {
        sendMessage();
    }
});


// function to change the dp
function changeDP() { }

function update() { }
// console.log(firebase.storage().ref().fullPath);