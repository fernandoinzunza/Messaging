$(document).ready(function () {
    $("#accept").on("click", function () {
        $("#loading").html('  <div class="progress"><div class="indeterminate"></div></div>');
        $("button").prop("disabled", true)
        $("i").addClass("grey-text text-lighten-3")
        $("label").addClass("grey-text text-lighten-3");
        $(".input-field input").css('border-bottom', '1px solid #eeeeee')
        $("h5").css("color", '#eeeeee')
        setTimeout(function () {
            /*
            $('#accept').prop('disabled', false);
            $("#loading").html('');
            $("button").prop("disabled", false);
            $("i").removeClass('grey-text text-lighten-3');
            $("label").removeClass("grey-text text-lighten-3");
            $(".input-field input").css('border-bottom', '0.8px solid #bdbdbd');
            $("h5").css("color", 'gray')
            $("#panel").html('<div class="container animate__animated animate__fadeIn"><div class="row center"><h5 class="" style="color:#bdbdbd">Welcome</h5></div><div class="row center"><a href="/Dash/Inicio" style="text-decoration: underline">Go to dashboard</a></div></div>')
            
       */
            window.location.replace("https://localhost:44305");
        }, 4000);
        


    })
});