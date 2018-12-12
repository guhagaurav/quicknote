(function () {

    //Defining namespace
        var stickyNotes = function () {

            return {
                variables: {
                    "id": '',
                    "length": '',
                    "text_remaining": '',
                    result: [],
                    addNoteFlag: true
                },

                redirectLoginNote: function (){
                    $.ajax({
                        type: 'GET',
                        contentType: 'application/json',
                        url: '/',
                        success: function(data) {
                            if(data){
                                window.location='https://quick--note.herokuapp.com'
                            }
                        }
                    })
                },

                loginNote: function (loginDetails) {
                    var self = this;
                    $.ajax({
                        type: 'POST',
                        data: loginDetails,
                        contentType: 'application/json',
                        url: '/api/login',
                        success: function(status) {
                            console.log(status)
                        if (status == 404){
                            $("#err-msg-login").empty();
                            $("#err-msg-login").append(" Check the password or Please Register ");
                        }
                        else if (status.length === 2 || status.length === 1){
                            var result = status.map(a => a.msg);
                            $("#err-msg-login").empty();
                            $("#err-msg-login").append(result);
                        }
                        else {
                            window.location='https://quick--note.herokuapp.com/notes'
                        }
                        }
                    });
                },

                registerNote: function (registerData){
                    var self = this;

                    $.ajax({
                        type: 'POST',
                        data: registerData,
                        contentType: 'application/json',
                        url: '/api/registerUser',
                        success: function(status) {
                            console.log("REGISTR SAVE ",status);
                            $('#err-msg-register').empty();
                            if(status == false){
                                $('#err-msg-register').append("Field Validation Error!!");
                            }
                            else if (status == true){
                                $('#success-msg-register').append("Registration Success!! Click Login to Proceed >>");
                                $( "#login-register" ).fadeIn( "slow" )
                                self.clearDataRegister();
                            }
                            else if (status.name == "MongoError"){
                                $('#success-msg-register').empty();
                                $('#success-msg-register').append("Registration Success!! Click Login to Proceed >>");
                            }
                        }

                        })
                    },

                searchNote: function (searchText) {
                    var self = this;
                    let data = {};
                    data.searchText = searchText;
                    var newData = JSON.stringify(data)
                    $("#tbl").empty();

                    $.ajax({
                        type: 'POST',
                        data: newData,
                        contentType: 'application/json',
                        url: '/api/notes/search',
                        success: function(data) {
                            for (let index in data) {
                                self.variables.result.push(data[index])
                                $("#tbl").append("<tr><td>" + index + "</td> <td><div class='note'>" +
                                "<p>Subject: " + data[index].subject + "</p>" +
                                "<p>Message: " + data[index].message + "</p>" +
                                " <p> Message Length: " + data[index].noteLength+ "</p>" +
                                "<strong>Author: " + data[index].author + "</strong>" + " <span>, " + data[index].noteTime + "</span>" +
                                "</div></td><td><button type='button' data-toggle='modal' data-target='#myModal' class='btn-sm edit-btn btn btn-primary' data-index='" + index + "'" + "id='edit-btn" + index + "'" + ">Edit</button> " +
                                "<button type='button' class='btn-sm del-btn btn btn-danger' data-index='" + data[index]._id + "'" + "id='del-btn'>Delete</button>" +
                                "<button type='button' class='btn-sm sms-btn btn btn-info' data-index='" + index + "'" + "id='sms-btn'>Send SMS</button></td></td></tr>");

                            index++;

                                }
                        let len = data.length;
                        $("#tot-count").text(len);

                    }

                    });

                },

                sendSMS: function (ph, msgBody) {
                    let self = this;
                    let parseBody = JSON.parse(msgBody)
                    parseBody.notePhone = ph;
                    let msg = JSON.stringify(parseBody);
                    $.ajax({
                        type: 'POST',
                        data: msg,
                        contentType: 'application/json',
                            url: '/api/sms',
                            success: function(data) {
                            if (data.messages[0].status == 0){
                                self.showAlertInfo("Message sent Successfully")
                            }
                            else if (data.messages[0].status != 0) {
                                self.showAlertDanger(data.messages[0]["error-text"])
                            }
                        }
                    });
                },

                addNote: function (obj) {
                    var self = this;
                    var length = $('#text-count').attr("maxlength");
                    $('#text-count').html(length);
                    $.ajax({
                        type: 'POST',
                        data: obj,
                        contentType: 'application/json',
                        url: '/api/notes',
                        success: function(data) {
                            setTimeout(function () {
                                self.getNote();
                            }, 100);
                        }
                    });
                },

    //getNote function will get the notes from mongoDB and display in UI
                getNote: function () {
                    this.variables.result = [];
                    $("#tbl").empty();
                    var self = this;
                    $.ajax({
                        type: 'GET',
                        contentType: 'application/json',
                        url: '/api/notes',
                        success: function(data) {
                        for (let index in data) {
                            self.variables.result.push(data[index])
                            $("#tbl").append("<tr><td>" + index + "</td><td><div class='note'>" +
                            "<p>Subject: " + data[index].subject + "</p>" +
                            "<p>Message: " + data[index].message + "</p>" + " <p> Message Length: " + data[index].noteLength+ "</p>" +
                            "<strong>Author: " + data[index].author + "</strong>" + " <span>, " + data[index].noteTime + "</span>" +
                            "</div></td><td><button type='button' data-toggle='modal' data-target='#myModal' class='btn-sm edit-btn btn btn-primary' data-index='" + index + "'" + "id='edit-btn" + index + "'" + ">Edit</button> " +
                            "<button type='button' class='btn-sm del-btn btn btn-danger' data-index='" + data[index]._id + "'" + "id='del-btn'>Delete</button>" +
                            "<button type='button' class='btn-sm sms-btn btn btn-info' data-index='" + index + "'" + "id='sms-btn'>Send SMS</button></td></td></tr>");

                        index++;

                            }
                    var len = data.length;
                    $("#tot-count").text(len);
                        }
                    });

                },

    //editNote function will allow the user to edit note
                editNote: function (obj) {
                    let self = this;
                    let id = obj.index;
                    let data = JSON.stringify(obj);
                    $.ajax({
                        type: 'PUT',
                        data: data,
                        contentType: 'application/json',
                        url: '/api/notes/'+id,
                        success: function(data) {
                            setTimeout(function () {
                                self.getNote();
                            }, 100);
                        }
                    });

                },

    //delNote function will delete the note
                delNote: function (id) {
                    var self = this;
                    $.ajax({
                        type: 'DELETE',
                        contentType: 'application/json',
                        url: '/api/notes/'+id,
                        success: function(data) {
                            setTimeout(function () {
                                self.getNote();
                            }, 100);
                        }
                    });
                },


    //getData function will get the data from DOM
                getDataAddNote: function () {
    //validating for script tags with RegEx
                    let subj = $("#noteSubjectField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    let msg = $("#noteMessageField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    let auth = $("#noteNameField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //validating for script tags with jquery
                    //var encodedMsg = $('<div />').text(msg).html();
                    //var encodedAuth = $('<div />').text(auth).html();
                    let d = new Date();
                    let length = $('#noteMessageField').val().length;
                    let timeStamp = d.toLocaleDateString() + ", " + d.toLocaleTimeString();
                    let data = {};
                    data.subject = subj;
                    data.message = msg;
                    data.author = auth;
                    data.noteLength = length;
                    data.noteTime = timeStamp;
                    return JSON.stringify(data);
                },

                getDataLoginNote: function () {
                    let loginEmail = $("#loginEmail").val();
                    let loginPassword = $("#loginPassword").val();
                    let data = {};
                    data.loginEmail = loginEmail;
                    data.loginPassword = loginPassword;
                    return JSON.stringify(data);
                },

                getDataRegisterNote: function () {
                    let registerClientData = document.getElementById("register-form-client").elements;
                    let data = {};
                    data.fNameClient = $(registerClientData['fNameClient']).val();
                    data.lNameClient = $(registerClientData['lNameClient']).val();
                    data.passClient = $(registerClientData['passClient']).val();
                    data.confirmPassClient = $(registerClientData['confirmPassClient']).val();
                    data.emailClient = $(registerClientData['emailClient']).val();
                    data.phClient = $(registerClientData['phClient']).val();
                    data.secAnsClient = $(registerClientData['secAnsClient']).val();
                    data.secQuesClient = $(registerClientData['secQuesClient']).val();
                    let radios = document.getElementsByName('gender');
                    for (var i = 0, length = radios.length; i < length; i++)
                        {
                            if (radios[i].checked)
                                {
                                    data.gender = radios[i].value;
                                    break;
                                }
                        }
                    return JSON.stringify(data);
                },

                clearDataRegister: function (){
                    let registerClientData = document.getElementById("register-form-client").elements;
                    $(registerClientData['fNameClient']).val('');
                    $(registerClientData['lNameClient']).val('');
                    $(registerClientData['passClient']).val('');
                    $(registerClientData['confirmPassClient']).val('');
                    $(registerClientData['emailClient']).val('');
                    $(registerClientData['phClient']).val('');
                    $(registerClientData['secAnsClient']).val('');
                    $(registerClientData['secQuesClient']).val('');
                },


    //showAlert function will show animated alerts
                showAlertInfo: function (msg) {
                    $('.alert.alert-info').text(msg).slideDown(500).delay(4000).slideUp(500);
                },

                showAlertDanger: function (msg) {
                    $('.alert.alert-danger').text(msg).slideDown(500).delay(4000).slideUp(500);
                },

    //getEditNote function will get the data saved in array from the DOM
                getEditNote: function (row) {

                    $("#noteNameField").val(row.author);
                    $("#noteMessageField").val(row.message);
                    $("#noteSubjectField").val(row.subject);
                    $("#noteSubjectField").attr('data-Index-id', row._id)
                },

    //clickOps function will handle all the click events.
                clickOps: function () {
                    var self = this;

                    $(document).on("click", "#add-note", function () {
                        self.variables.addNoteFlag = true;
                        self.variables.length = $('#text-count').attr("data-max-length");
                        $('#text-count').html(self.variables.length);
                        $("#noteSubjectField").val('');
                        $("#noteMessageField").val('');
                        $("#noteNameField").val('');
                    });

                    $(document).on("click", "#searchbtn", function () {
                        let searchText = $("#searchNote").val();
                        self.searchNote(searchText);
                    });

                    $(document).on("click", "#loginbtn", function () {
                        self.loginNote(self.getDataLoginNote());
                    });

                    $(document).on("click", "#login-register", function (e) {
                        self.redirectLoginNote();
                        e.preventDefault();
                    });

                    $(document).on("click", "#registerbtn", function (e) {

                        self.registerNote(self.getDataRegisterNote());
                        e.preventDefault();
                        e.stopPropagation();
                    });

                    $(document).on("click", "#submitbtn", function () {
                        if (self.variables.addNoteFlag){
                            self.addNote(self.getDataAddNote());
                            self.showAlertInfo('Note Added Successfully');
                        }
                        else {
                            self.variables.id = $("#noteSubjectField").attr('data-Index-id');
                            let obj = self.getDataAddNote();
                            let jsonObj = JSON.parse(obj)
                            jsonObj.index = self.variables.id;
                            self.editNote(jsonObj);
                            self.showAlertInfo('Note Updated Successfully');
                        }
                        $('#myModal').modal('hide');
                    });

                    $(document).on("click", ".edit-btn", function () {
                        self.variables.addNoteFlag = false;
                        self.variables.id = Number(($(this).attr('data-index')));
                        let row = self.variables.result;
                        self.getEditNote(row[self.variables.id]);
                        self.messageCount();
                    });

                    $(document).on("click", ".del-btn", function () {
                        $('#confirm-delete').modal('show');
                        var id = $(this).attr('data-index');
                        $('#note-delete').attr('data-index', id);
                    });

                    $(document).on("click", ".sms-btn", function () {
                        $('#notephoneField1').val('');
                        $('#notephoneField2').val('');
                        $('#confirm-sms').modal('show');
                        let row = self.variables.result;
                        let dataIndex = Number(($(this).attr('data-index')));
                        self.getEditNote(row[dataIndex]);

                    });

                    $(document).on('click', '#note-sendSMS', function () {
                        let ph1 = $('#notephoneField1').val();
                        let ph2 = $('#notephoneField2').val();
                        let ph = ph1.concat(ph2);
                        let msgBody = self.getDataAddNote();
                        self.sendSMS(ph, msgBody);
                        $('#confirm-sms').modal('hide');
                    })

                    $(document).on('click', '#note-delete', function () {
                        self.variables.id = $('#note-delete').attr('data-index');
                        self.delNote(self.variables.id);
                        self.showAlertDanger('Note Deleted Successfully.');
                        $('#confirm-delete').modal('hide');
                    });

                    $(document).on('input', '#noteMessageField', function () {
                        self.messageCount();
                    });

                    $(document).ready(function(){
                        $('#register-link').attr('disabled',true);
                        $( "#login-register" ).fadeOut( "fast" )
                    });
                },

                messageCount: function () {
                    var textLength = $('#noteMessageField').val().length;
                    var maxLength = Number($('#text-count').attr("data-max-length"));
                    $("#text-count").text((maxLength - textLength) + " of " + maxLength);
                }
            }
        };

        var stickyNotes = new stickyNotes();
        stickyNotes.clickOps();
        stickyNotes.getNote();


    }());

