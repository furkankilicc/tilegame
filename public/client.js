var socket = io.connect('http://localhost:3000');
var mySocketID;
var myName;
var myRoom;

socket.on('connect', () => {
    mySocketID = socket.id;
});

socket.on('updateRooms', (data) => {
    updateRooms(data[0], data[1]);
});

socket.on('readyToSeeRooms', (data) => {
    $('#currentPage').fadeOut(500, function () {
        $('.border-bottom.pb-2.mb-0').text("Odalar");
    }).fadeIn();

    if (data[0] == true && data[1] == mySocketID) {
        $('.container.login').fadeOut(500, function (){
        $('.container.login').remove();

            $("<div class=\"container\">\n" +
                "    <div class=\"row\">\n" +
                "        <div class=\"col\">\n" +
                "            <div class=\"my-3 p-3 bg-body rounded shadow-lg w-100\">\n" +
                "                <h6 class=\"border-bottom pb-2 mb-0\">Odalar</h6>\n" +
                "<small class=\"d-block text-end mt-3 border-top\">\n" +
                "                    <a role=\"button\" class=\"btn btn-success mt-2\" data-bs-toggle=\"modal\" data-bs-target=\"#createRoomModal\">Oda Oluştur</a>\n" +
                "                </small>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</div\n" +
                "\n" +
                "<!-- Modal -->\n" +
                "<div class=\"modal fade\" id=\"createRoomModal\" tabindex=\"-1\" role='dialog' aria-labelledby=\"createRoomModalLabel\" aria-hidden=\"true\">\n" +
                "  <div class=\"modal-dialog\" role='document'>\n" +
                "    <div class=\"modal-content\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h5 class=\"modal-title\" id=\"createRoomModalLabel\">Oda Oluştur</h5>\n" +
                "        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\n" +
                "      </div>\n" +
                "      <div class=\"modal-body\">\n" +
                "        <label for=\"inputRoomName\" class=\"form-label\">Oda İsmi</label>\n" +
                "<input type=\"text\" id=\"inputRoomName\" placeholder='Oda ismini giriniz...' class=\"form-control\">\n" +
                "      </div>\n" +
                "      <div class=\"modal-footer\">\n" +
                "        <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\" onclick='clearTextbox()'>Kapat</button>\n" +
                "        <button type=\"button\" class=\"btn btn-primary\" onclick='createRoom()'>Oluştur</button>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</div>").hide().appendTo("body").promise().done(function () {
                 $('#createRoomModal').css('display', 'none');
                myRoom = "roomsPage";
                updateRooms(data[2], data[3]);
            });
        });
    }
});

function sendForm () {
    let user = [$('#playerNameInput').val(), mySocketID];
    socket.emit('newPlayer', {user});
}

function clearTextbox() {
    $('input[id=inputRoomName]').val("");
}

function updateRooms(roomNames, roomPlayerCounts) {
    $('.d-flex.text-muted.pt-3').fadeOut(500, function () {
        $('.d-flex.text-muted.pt-3').remove();
    });
    var i = 0;
    roomNames.forEach(function () {
    roomName = roomNames[i];
    if (roomName != "roomsPage" && myRoom == "roomsPage") {
        if ($(".display-4.text-center.mt-4").length == 1) {
            $(".display-4.text-center.mt-4").fadeOut(500, function () {
                $(".display-4.text-center.mt-4").remove();
            });
        }
        let result = roomPlayerCounts.find(obj => {
            return obj.roomName === roomName
        });
        var playerCount = result.playerCount
        $("h6.border-bottom.pb-2.mb-0").after("<div class=\"d-flex text-muted pt-3\" style=\"display: none;\" id=\"" + i + "\">\n" +
            "                    <svg class=\"bd-placeholder-img flex-shrink-0 me-2 rounded\" width=\"70\" height=\"70\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Placeholder: 70x70\" preserveAspectRatio=\"xMidYMid slice\" focusable=\"false\"><rect width=\"100%\" height=\"100%\" fill=\"#007bff\"/><text x=\"48%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"white\" font-size=\"1.4rem\">" + playerCount + "/2</text></svg>\n" +
            "\n" +
            "                    <div class=\"pb-3 mb-0 small lh-sm w-100\">\n" +
            "                        <div class=\"d-flex justify-content-between\">\n" +
            "                            <h3 class=\"text-gray-dark m-2\">Oda " + roomName + "</h3>\n" +
            "                            <div class=\"row\">\n" +
            "                                <div class=\"col col-lg-6\">\n" +
            "                                    <a role=\"button\" class=\"btn btn-secondary p-1 spec-button\">Seyirci Olarak Katıl</a>\n" +
            "                                </div>\n" +
            "                                <div class=\"col col-lg-4\">\n" +
            "                                    <a role=\"button\" onclick='joinToRoom()' class=\"btn btn-primary join-button\">Katıl</a>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"d-flex\">\n" +
            "                            <span class=\"d-block spec font-weight-light\">İzleyici Sayısı: 0</span>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>").children(':last').hide().fadeIn(250);
        // room update ok i think
        $('.container').fadeIn();
    } else if (roomNames.length == 1 && roomNames[0] == "roomsPage") {
        $("h6.pb-2.mb-0").after("<h1 class=\"display-4 text-center mt-4 \">Henüz bir oda oluşturulmamış!</h1>");
        $(".display-4.text-center.mt-4").hide().fadeIn(500);
        $('.container').fadeIn()
    }
    i++;
});
}

function joinToRoom() {
    // join to room when user clickes "katıl" button
}

function createRoom() {
    if ($('#createRoomModal').data('bs.modal')?._isShown == undefined) {
        var roomName = $('input[id=inputRoomName]').val();
        myRoom = roomName;
        let data = [roomName, mySocketID];
        socket.emit('createRoom', {data});
        $('#createRoomModal').modal('hide');

        $('small').fadeOut(1000, function () {
            $('small').remove();
        });
        $('.d-flex.text-muted.pt-3').fadeOut(500, function () {
            $('.d-flex.text-muted.pt-3').remove();
        });
        $('.display-4.text-center.mt-4').fadeOut(500, function () {
            $('.display-4.text-center.mt-4').remove();
        });
        $('.border-bottom.pb-2.mb-0').fadeOut(500, function () {
            $('.border-bottom.pb-2.mb-0').text("Oda " + roomName);
        }).fadeIn();
    } else {
        $('#createRoomModal').modal('show');
    }

}