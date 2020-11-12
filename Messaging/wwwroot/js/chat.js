$(document).ready(function () {
    /*
     camara
     */
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
    var el = document.querySelectorAll('.modal');
    var instances = M.Modal.init(el, { dismissible: false });
    'use strict';
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const snap = document.getElementById("snap");
    var imageURL = "";
    var mensajeImagen = false;
    var contArchivos = 0;
    var numArchivos = 0;
    const errorMsgElement = document.querySelector('span#errorMsg');
    $("#enviarFoto").hide();
    $("#retake").hide();
    let archivosTemp = [];
    let arregloImagenes = [];
    const constraints = {
        audio: false,
        video: {
            width: 720, height: 480
        }
    };
    // Access webcam
    async function init() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            handleSuccess(stream);
        } catch (e) {
            errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
        }
    }
    // Success
    function handleSuccess(stream) {
        window.stream = stream;
        video.srcObject = stream;
    }

    // Load init
    // Draw image
    var context = canvas.getContext('2d');
    snap.addEventListener("click", function () {
        $("#snap").fadeOut();
        $(".video-wrap").fadeOut();
        $("#enviarFoto").fadeIn();
        $("#retake").fadeIn();
        context.drawImage(video, 0, 0, 720, 480);
        $("#texto-imagen").fadeIn();
        $("#labelImagen").fadeIn();
        $("#btnEnviarFoto").fadeIn();
        mensajeImagen = true;

    });
    $("#camara").click(function () {
        var modal = $("#modal2");
        var instance = M.Modal.getInstance(modal);
        instance.open();
        init();
        $(".video-wrap").fadeIn();
        $("#snap").fadeIn();
    })
    $("#retake").click(function () {
        $(".video-wrap").fadeIn();
        $("#snap").fadeIn();
        $("#image-taken-route").val('');
        mensajeImagen = false;
        $(this).hide();
        $("#btnEnviarFoto").fadeOut();
        $("#texto-imagen").fadeOut();
        $("#labelImagen").fadeOut();
    })
    function cerrarCamara() {
        var modal = $("#modal2");
        var instance = M.Modal.getInstance(modal);
        instance.close();
        const mediaStream = video.srcObject;
        const tracks = mediaStream.getTracks();
        tracks[0].stop();
        mensajeImagen = false;
        imageURL = "";
        canvas.width = canvas.width;
        $("#retake").fadeOut();
        $("#texto-imagen").fadeOut();
        $("#btnEnviarFoto").fadeOut();
        $("#labelImagen").fadeOut();
    }

    $("#closeCamera").click(function () {
        cerrarCamara();
    })


    var colaEnviado = true;
    var colaRecibido = true;
    var colaCargarRecibido = true;
    var colaCargarEnviado = true;
    $("#mensaje").hide();
    $("#sendMessage").hide()
    $("#document").hide()
    $("#sendMessage").attr('visible', false);
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, { hoverEnabled: false });
    var elem = document.querySelectorAll('.tooltipped');
    var instance = M.Tooltip.init(elem, {});
    $("#anchor-photos").click(function () {
        $("#input-photos").click();
    })
    $("#anchor-file").click(function () {
        $("#input-file").click()
    })

    $("#mensaje").keyup(function () {
        var texto = $(this).val();
        if (texto == "") {
            $("#sendMessage").attr('disabled', true);
        }
        else {
            $("#sendMessage").attr('disabled', false);
        }
    })

    $("#input-file").on("change", function (e) {
        var modal = $("#modal-documents");
        var instance = M.Modal.getInstance(modal);
        instance.open();

        var file = e.target.files[0];
        archivosTemp.push(file);
        if (file.type == "application/pdf") {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var pdfData = new Uint8Array(this.result);
                // Using DocumentInitParameters object to load binary data.
                var loadingTask = pdfjsLib.getDocument({ data: pdfData });
                loadingTask.promise.then(function (pdf) {
                    console.log(pdf.numPages);
                    console.log('PDF loaded');

                    // Fetch the first page
                    var pageNumber = 1;
                    pdf.getPage(pageNumber).then(function (page) {
                        $("#pages-count").text(pdf.numPages + " Pages");
                        console.log('Page loaded');
                        var desiredWidth = 300;
                        var viewport = page.getViewport({ scale: 1, });
                        var scale = desiredWidth / viewport.width;
                        var scaledViewport = page.getViewport({ scale: scale, });
                        // Prepare canvas using PDF page dimensions
                        var canvas = $("#previa")[0];
                        var context = canvas.getContext('2d');
                        canvas.height = 400;
                        canvas.width = 300;

                        // Render PDF page into canvas context
                        var renderContext = {
                            canvasContext: context,
                            viewport: scaledViewport
                        };
                        var renderTask = page.render(renderContext);
                        renderTask.promise.then(function () {
                            console.log('Page rendered');
                            var previa = document.getElementById("previa");
                            var image = previa.toDataURL("image/png");
                            arregloImagenes.push(image);
                            var li = "<li id='arch-" + contArchivos + "' style='display:inline; width: 8rem; height:8rem; margin-right: 0.5rem; position:relative;z-index:0'><a href='#' class='material-icons quitar' style='z-index:1;position:absolute;right:0'>close</a><img class='responsive-img' style='width: 8rem; height: 8rem;' src='" + image + "' /></li>";
                            $("#add-files").append(li);
                            contArchivos++;
                            numArchivos++;
                        });
                    });
                }, function (reason) {
                    // PDF loading error
                    console.error(reason);
                });

            };
            fileReader.readAsArrayBuffer(file);

        }

    })

    var ElementosClick = new Array();
    // Capturamos el click y lo pasamos a una funcion
    document.onclick = captura_click;

    function captura_click(e) {
        // Funcion para capturar el click del raton
        var HaHechoClick;
        var clase;
        var id;
        if (e == null) {
            // Si hac click un elemento, lo leemos
            HaHechoClick = event.srcElement.tagName;
            clase = event.srcElement.className;
            id = event.srcElement.parentNode.id;
            if (HaHechoClick == "A" && clase == "material-icons quitar") {
                $("#" + id).animate({ width: 0, "padding-left": 0, "padding-right": 0, "margin-left": 0, "margin-right": 0 }, 500, function () {
                    $(this).remove();
                    $("#" + id).remove();
                })



                if (numArchivos > 0) { numArchivos--; }
                if (numArchivos == 0) {
                    var modal = $("#modal-documents");
                    var instance = M.Modal.getInstance(modal);
                    instance.close();
                    numArchivos == 0;
                }


            }
        } else {
            // Si ha hecho click sobre un destino, lo leemos
            HaHechoClick = e.target.tagName;
            clase = event.srcElement.className;
            id = event.srcElement.parentNode.id;
            if (HaHechoClick == "A" && clase == "material-icons quitar") {
                $("#" + id).animate({ width: 0, "padding-left": 0, "padding-right": 0, "margin-left": 0, "margin-right": 0 }, 500, function () {
                    $(this).remove();

                    $("#" + id).remove();
                })
                var index = $("#" + id).index();
                arregloImagenes.splice(index, 1);

                if (index == arregloImagenes.length) {
                    var canvas = document.getElementById("previa");
                    var ctx = canvas.getContext("2d");

                    var image = new Image();
                    image.onload = function () {
                        ctx.drawImage(image, 0, 0);
                    };

                    image.src = arregloImagenes[arregloImagenes.length - 1];
                }
                if (numArchivos > 0) { numArchivos--; }
                if (numArchivos == 0) {
                    var modal = $("#modal-documents");
                    var instance = M.Modal.getInstance(modal);
                    instance.close();
                    numArchivos == 0;
                }


            }


        }

        // Añadimos el elemento al array de elementos
        //  ElementosClick.push(HaHechoClick);
        // Una prueba con salida en consola
        // console.log("Contenido sobre lo que ha hecho click: " + HaHechoClick);
    }

    $("#add-file-btn").click(function () {
        $("#input-file").click()
    })
    $("#closeModalDocument").click(function () {
        var modal = $("#modal-documents");
        var instance = M.Modal.getInstance(modal);
        instance.close();
        numArchivos == 0;
    });
    $("li").on('click', "#data-select", function () {
        var tel = $(this).attr('data-id');
        $("#destinoFocused").val(tel);
        $("#mensaje").show();
        $("#sendMessage").show()
        $("#document").show()
        $("#contMensajes-" + tel).addClass("scale-out");
        $("#contMensajes-" + tel).removeClass("scale-in");
        var conectado = 0;
        $.ajax({
            url: '/Dash/MostrarOnline',
            method: "POST",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("XSRF-TOKEN",
                    $('input:hidden[name="RequestVerificationToken"]').val());
            },
            data:
            {
                telefono: $("#destinoFocused").val()
            },
            success: function (data) {
                if (data.online == 1) {
                    var conectado = data.online;
                    $("#header-online").css('padding-top', '0.75rem');
                    $("#header-online").html('<div id="online-name" style="margin-left:3rem; font-size:medium; font-weight:400;"></div><div id="online" style="margin-left:3rem; font-size:smaller; color:grey;"></div>');
                    $("#online-name").text(data.nombre)
                    $("#online").text("Online")
                }
                else {
                    $("#header-online").css('padding-top', '0.75rem');
                    $("#header-online").html('<div id="online-name" style="margin-left:3rem; font-size:medium; font-weight:400;"></div><div id="online" style="margin-left:3rem; font-size:smaller; color:grey;"></div>');
                    $("#online-name").text(data.nombre)
                    $("#online").text("Last " + data.ultima)
                }
            }
        })
        connection.invoke("Seen", tel).catch(function (err) {
            return alert(err.toString())
            console.log('error al enviar');
        })

        var desti = $("#destinoFocused").val();
        $("#messages-list").html('');
        $.ajax({
            url: '/Dash/Visto',
            method: "POST",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("XSRF-TOKEN",
                    $('input:hidden[name="RequestVerificationToken"]').val());
            },
            data: {
                destino: desti
            }
        })
        $.ajax({
            url: '/Dash/CargarMensajes',
            method: "POST",
            dataType: 'JSON',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("XSRF-TOKEN",
                    $('input:hidden[name="RequestVerificationToken"]').val());
            },
            data:
            {
                telefono: desti
            },
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].emisor == $("#destinoFocused").val() && data[i].receptor == $("#telSession").val() && colaCargarRecibido) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img style='width:100%' class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");
                        }
                        else {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem;word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem;word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");

                        }
                        colaCargarRecibido = false;
                        colaCargarEnviado = true;
                    }
                    else if (data[i].emisor == $("#destinoFocused").val() && data[i].receptor == $("#telSession").val() && !colaCargarRecibido) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /></div></div></div>");
                        }
                        else {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");

                        }
                    }
                    else if (colaCargarEnviado && data[i].emisor == $("#telSession").val() && data[i].receptor == $("#destinoFocused").val()) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                        }
                        else if (data[i].estado == "Enviado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");

                        }
                        else if (data[i].estado == "Visto") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                        }
                        colaCargarEnviado = false;
                        colaCargarRecibido = true;
                    }
                    else if (data[i].emisor == $("#telSession").val() && data[i].receptor == $("#destinoFocused").val() && !colaCargarEnviado) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                        }
                        else if (data[i].estado == "Enviado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                        }
                        else if (data[i].estado == "Visto") {
                            if (data[i].tipo == "Texto") {
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; max-width:18rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                                // $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            }
                            else if (data[i].tipo == "Imagen") {
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            }
                        }
                    }
                }
                var yo = $("#telSession").val();
                connection.invoke("VistoOnline", desti, yo).catch(function (err) {
                    return alert(err.toString())
                    console.log('error al enviar');
                })
                $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);

            }
        })
    })
    "use strict";
    var usuario = $("#hdnSession").val()
    var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub?user=" + usuario).withAutomaticReconnect().build();
    $("#sendMessage").attr('disabled', true);
    console.log('estableciendo conexion')
    connection.on("ReceiveMessage", function (user, typing) {
        $("#ult-" + user).css("font-style", "normal");
        if (typing.state == "Typing...") {
            $("#ult-" + user).text('Typing...');
            $("#ult-" + user).removeClass('grey-text');
            $("#ult-" + user).addClass('green-text');
        }
        if (typing.state == "Just-Online" && $("#destinoFocused").val() == user) {
            $("#online").text("Online");
        }
        if (typing.state == "Unread" && user == $("#destinoFocused").val()) {
            $(".state").each(function () {
                if ($(this).attr('data-state') == "Enviado") {
                    $(this).attr('data-state', "Entregado")
                    var icono = $(this).find('i');
                    icono.text("done_all");
                }
            })
            var ultimoMensaje = $("#ult-" + user).find("i");
            ultimoMensaje.text("done_all");
        }
        if (typing.state == "Just-Offline" && $("#destinoFocused").val() == user) {
            $("#online").text(typing.message);
        }
        if (typing.state == "Typing..." || typing.state == "Online") {
            if ($("#destinoFocused").val() == user)
                $("#online").text(typing.state);
            if (typing.state == "Online") {
                $("#ult-" + user).text(typing.message);
                $("#ult-" + user).addClass('grey-text');
                $("#ult-" + user).removeClass('green-text');
                var contador = $("#contMensajes" + user);
                if (contador.attr("data-status") == "inactivo") {
                    contador.addClass("new badge");
                }
            }
        }
        if (typing.state == "ClickChat" && typing.message == $("#destinoFocused").val()) {
            $(".enviados").each(function () {
                var paloma = $(this).find("i");
                paloma.css("color", "blue");
            });
        }
        if (typing.state == "SeenOnline" && typing.message == "Visto") {
            $(".enviados").each(function () {
                var paloma = $(this).find("i");
                paloma.css("color", "blue");
            });
            var dest = $("#destinoFocused").val();
            var palomaLista = $("#ult-" + dest).find("i")
            palomaLista.css("color", "blue")
        }
        if (typing.state == "Sent") {
            var message = typing.message;
            var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            $.ajax({
                url: '/Dash/MensajesNoLeidos',
                method: "POST",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("XSRF-TOKEN",
                        $('input:hidden[name="RequestVerificationToken"]').val());
                },
                data:
                {
                    telefono: user
                },
                success: function (data) {
                    if ($("#destinoFocused").val() != user) {
                        $("#contMensajes-" + user).addClass('new badge green scale-transition');
                        $("#contMensajes-" + user).removeClass('scale-out');
                        $("#contMensajes-" + user).addClass('scale-in');
                        $("#contMensajes-" + user).attr("data-badge-caption", data);
                        $("#contMensajes-" + user).attr("data-status", "activo");

                    }
                }
            })
            if (colaRecibido && $("#destinoFocused").val() == user) {
                if (typing.kind == "Texto")
                    $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem'>" + msg + "</div></div></div>");
                else if (typing.kind == "Imagen")
                    $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem'><img class='responsive-img' src='../../files/" + typing.url + "'></div></div></div>");
                colaRecibido = false;
                $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                var yo = $("#telSession").val();
                connection.invoke("VistoOnline", user, yo).catch(function (err) {
                    return alert(err.toString())
                    console.log('error al enviar');
                })
            }
            else if ($("#destinoFocused").val() == user) {
                var yo = $("#telSession").val();
                connection.invoke("VistoOnline", user, yo).catch(function (err) {
                    return alert(err.toString())
                    console.log('error al enviar');
                })
                if (typing.kind == "Texto")
                    $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem'>" + msg + "</div></div></div>");
                else if (typing.kind == "Imagen")
                    $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem'><img class='responsive-img' src='../../files/" + typing.url + "'></div></div></div>");
                $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);

            }
            if (typing.kind == "Imagen") {
                $("#ult-" + user).css("font-style", "italic");
                $("#ult-" + user).text("Sent you an image");
            }
            var audio = document.getElementById("notificacion");
            audio.play();
            var selectedLi = $("#li-" + user);
            var indice = selectedLi.index();
            if (selectedLi.index() > 0) {
                $("ul").prepend(selectedLi);

            }
            colaEnviado = true;
        }
    });

    connection.start().then(function () {
        console.log('conexion establecida')
    }).catch(function (err) {
        alert(err.toString());
    });

    $("#mensaje").change(function () {
        if ($(this).val() == "") {
            var user = $("#destinoFocused").val();
            var vacio = true;
            connection.invoke("TypingMessage", user, vacio).catch(function (err) {
                return alert(err.toString())
                console.log('error al enviar');
            })
        }
        else {
            var vacio = false;
            var user = $("#destinoFocused").val();
            connection.invoke("TypingMessage", user, vacio).catch(function (err) {
                return alert(err.toString())
                console.log('error al enviar');
            })
        }
    });
    $("#sendMessage").on("click", function () {
        if ($("#mensaje").val() != "") {
            var mensaje = $("#mensaje").val();
            var user = $("#destinoFocused").val();
            $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem; position:relative'><div style='margin-right: 1rem'>" + mensaje + "</div><i class='tiny material-icons state' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
            connection.invoke("SendPrivateMessage", user, mensaje).catch(function (err) {
                return alert(err.toString())
                console.log('error al enviar');
            })
            $("#mensaje").val('');
            $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
            var vacio = true;
            connection.invoke("TypingMessage", user, vacio).catch(function (err) {
                return alert(err.toString())
                console.log('error al enviar');
            })
        }
    })
    $("#btnEnviarFoto").click(function () {
        var rutaImagen = "";
        if (mensajeImagen) {
            var image = canvas.toDataURL("image/png");
            image = image.replace('data:image/png;base64,', '');
            $.ajax({
                type: 'POST',
                url: "/Dash/EnviarImagenPrueba",
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("XSRF-TOKEN",
                        $('input:hidden[name="RequestVerificationToken"]').val());
                },
                data: { imagen: image }
            }).done(function (data) {
                rutaImagen = data;
            });
            var mensaje = $("#texto-imagen").val();
            imageURL = rutaImagen;
            var user = $("#destinoFocused").val();
            $.ajax({
                url: '/Dash/IsConnected',
                method: "POST",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("XSRF-TOKEN",
                        $('input:hidden[name="RequestVerificationToken"]').val());
                },
                data:
                {
                    tel: user
                },
                success: function (data) {
                    if (data == 1) {
                        if (colaEnviado) {
                            $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;' ><div style='margin-right: 1rem; overflow: visible;'><img class='responsive-img' src='../../files/" + imageURL + "'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");

                            colaEnviado = false;
                        }
                        else {
                            $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; overflow: visible;'><img class='responsive-img' src='../../files/'" + imageURL + " asp-append-version='true' />" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            colaRecibido = true;
                        }
                        var vacio = true;

                        connection.invoke("SendImage", user, imageURL, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#texto-imagen").val('');
                        var selectedLi = $("li-" + user);
                        $("ul").prepend(selectedLi);
                        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                        $("#ult-" + user).css("font-style", "italic");
                        $("#ult-" + user).html("<i class='tiny material-icons'>done_all</i>Sent an image");

                    }
                    else {
                        if (colaEnviado) {
                            $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;' ><div style='margin-right: 1rem;max-width:18rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            colaEnviado = false;
                        }
                        else {
                            $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; max-width:18rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            colaRecibido = true;

                        }
                        connection.invoke("SendDisconnectedImage", user, imageURL, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#mensaje").val('');
                        var selectedLi = $("#li-" + user);
                        $("ul").prepend(selectedLi);
                        $("#ult-" + user).html("<i class='tiny material-icons'>check</i>" + "Sent an image");

                    }
                    cerrarCamara();
                    $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                }
            });
        }
    })
    $('#mensaje').bind('keypress', function (e) {
        if (e.keyCode == 13 && $("#mensaje").val() != "") {
            var mensaje = $("#mensaje").val();
            var user = $("#destinoFocused").val();
            $.ajax({
                url: '/Dash/IsConnected',
                method: "POST",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("XSRF-TOKEN",
                        $('input:hidden[name="RequestVerificationToken"]').val());
                },
                data:
                {
                    tel: user
                },
                success: function (data) {

                    if (data == 1) {
                        if (colaEnviado) {
                            $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;' ><div style='margin-right: 1rem; overflow: visible;'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");

                            colaEnviado = false;
                        }
                        else {
                            $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; overflow: visible;'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");


                        }
                        colaRecibido = true;
                        var vacio = true;

                        connection.invoke("SendPrivateMessage", user, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        connection.invoke("TypingMessage", user, vacio).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#mensaje").val('');

                        var selectedLi = $("li-" + user);
                        $("ul").prepend(selectedLi);
                        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                        $("#ult-" + user).html("<i class='tiny material-icons'>done_all</i>" + mensaje);

                    }
                    else {
                        if (colaEnviado) {
                            $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;' ><div style='margin-right: 1rem;max-width:18rem; word-wrap: break-word;'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            colaEnviado = false;
                        }
                        else {
                            $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; max-width:18rem; word-wrap: break-word;'>" + mensaje + "</div><i class='tiny material-icons state' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            colaRecibido = true;
                        }

                        connection.invoke("SendDisconnectedMessage", user, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#mensaje").val('');
                        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                        var selectedLi = $("#li-" + user);

                        $("ul").prepend(selectedLi);
                        var vacio = true;
                        $("#ult-" + user).html("<i class='tiny material-icons'>check</i>" + mensaje);

                    }
                }
            });
        }
    });
})
function quitar() {
    var a = this.tagName;
    var li = a.parentNode;
    var id = li.id;
    $("#" + id).remove();

}