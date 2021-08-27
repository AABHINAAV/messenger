// for showing user's info
function setUserInfo() {
    let userId = firebase.auth().currentUser.uid;
    firebase.database().ref('users/' + userId).once('value', (data) => {
        document.querySelector('.user-image').style.backgroundImage = `url(${data.val().profileImageUrl})`
        document.querySelector('.users-name').innerHTML = data.val().fname + ' ' + data.val().lname;
        document.querySelector('.users-uname').innerHTML = data.val().uname;
        document.querySelector('.users-dob').innerHTML = data.val().dob;
    });
}


// called on clicking checkbox
// shows and hides the info-box
function infoBar() {
    let chkbox = document.querySelector('#show');
    if (chkbox.checked) {
        // reducing length of left side-----
        document.querySelector('.left').style.width = '0%';
        // making left side disappear-----
        document.querySelector('.left').style.visibility = 'hidden';
        // adding class to reciever's info box to 
        // make visible and give height and width-----
        document.querySelector('.info-box').classList.add('info-box-show');
        document.querySelector('.user-info').classList.add('userShow');
    }
    else {
        // removing class to reciever's info box to 
        // make invisible and remove height and width-----
        document.querySelector('.info-box').classList.remove('info-box-show');
        document.querySelector('.user-info').classList.remove('userShow');
        let x = setTimeout(() => {
            // increasing length of left side-----
            document.querySelector('.left').style.width = '32%';
            // making left side appear-----
            document.querySelector('.left').style.visibility = 'visible';
            clearTimeout(x);
        }, 700);
    }
}


// invokes when we click on three dots----
document.querySelector('#options').addEventListener('click', () => {
    // showing list if it is not visible else making visible----
    if (getComputedStyle(document.querySelector('.list')).visibility == 'visible') {
        document.querySelector('.list').style.visibility = 'hidden';
    }
    else {
        document.querySelector('.list').style.visibility = 'visible';
    }
});


// invoked on clicking profile button of list----
function showProfile() {
    // making list invisible----
    if (getComputedStyle(document.querySelector('.list')).visibility == 'visible') {
        document.querySelector('.list').style.visibility = 'hidden';
    }
    // making user info box visible
    if (getComputedStyle(document.querySelector('.main')).visibility == 'hidden') {
        document.querySelector('.main').style.visibility = 'visible';
    }
}


// invoked on clicking close button of user info box----
function closeProfile() {
    // making user info box invisible----
    document.querySelector('.main').style.visibility = 'hidden';
}




// // // // changing DP-----
// let btn = document.querySelector('#image');

// btn.addEventListener('click', () => {
//     btn.addEventListener('change', () => {

//         // creating variable for username-----
//         var globalUname;

//         // taking current user uid----
//         let userId = firebase.auth().currentUser.uid;

//         // reading and storing value of user's uname in globalUname variable-----
//         firebase.database().ref('users/' + userId).once('value', (data) => {
//             globalUname = data.val().uname;
//             console.log(globalUname);

//         }).then(() => {
//             // taking first file selected button-----
//             const file = btn.files[0];

//             // creating name of file-----
//             const name = `${globalUname}-ProfilePicture`;

//             // checking if file is selected or not-----
//             if (file == undefined) {
//                 console.log('no file selected');
//             }
//             else {

//                 // uploading file and making is object-----
//                 let uploadTask = firebase.storage().ref('/users/' + globalUname).child(name).put(file);

//                 // checking state of uploading file-----
//                 uploadTask.on('state_changed', function (uploadStatus) {
//                     // getting progress of upload-----
//                     let progress = (uploadStatus.bytesTransferred / uploadStatus.totalBytes) * 100;

//                     // pringting progress of file upload task-----
//                     console.log(`upload is ${progress}% done`);

//                     // printing status of file upload task-----
//                     console.log(typeof (uploadStatus.state));

//                     // checking if file upload is paused or running-----
//                     switch (uploadStatus.state) {
//                         case firebase.storage.TaskState.PAUSED: console.log('upload is paused');
//                             break;
//                         case firebase.storage.TaskState.RUNNING: console.log('upload is running');
//                             break;
//                     }
//                 }, function (error) {
//                     // handling errors-----
//                     switch (error.code) {
//                         case 'storage/unauthenticated': console.log('you are not unauthenticated user, please authenticate and try again.');
//                             break;
//                         case 'storage/unauthorized': console.log('you are not authorized to perform the desired action');
//                             break;
//                         case 'storage/object-not-found': console.log('No object exists at the desired reference');
//                             break;
//                         case 'storage/quota-exceeded': console.log('Quota on your Cloud Storage bucket has been exceeded.');
//                             break;
//                         case 'storage/canceled': console.log('User canceled the operation.');
//                             break;
//                     }
//                 });

//                 // making url of uploaded file-----
//                 uploadTask.then(data => data.ref.getDownloadURL()).then((imageUrl) => {
//                     // adding url of profile image to its id-----
//                     let newData = {
//                         'profileImageUrl': imageUrl
//                     }
//                     firebase.database().ref('users/').child(userId).update(newData);
//                     firebase.database().ref('unames/').child(globalUname).update(newData);
//                 });
//             }
//         });
//     });
// });