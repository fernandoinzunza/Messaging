$(document).ready(function () {
    var textNeedCount = document.querySelectorAll('#phone');
    M.CharacterCounter.init(textNeedCount);
    $("#accept").click(function () {
        var first_name  =  $("#first_name").val();
        var surname =  $("#surname").val();
        var phone  =  $("#phone").val();
        var email  =  $("#email").val();
        var pass = $("#pass").val();
        var confirm = $("#confirm").val();
        $.ajax({
            url: '/Registro/Crear',
            method: "POST",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("XSRF-TOKEN",
                    $('input:hidden[name="RequestVerificationToken"]').val());
            },
            data:
            {
                first_name: first_name,
                surname: surname,
                phone: phone,
                email: email,
                pass: pass,
                confirm:confirm
            },
            success: function (data) {
                $("#mens").text(data);
                const elem = document.getElementById('modal1');
                const instance = M.Modal.init(elem, { dismissible: false });
                instance.open();
            }
        })
    })
})