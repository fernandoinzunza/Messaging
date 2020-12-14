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
    var contMedia = 0;
    var numArchivos = 0;
    var arregloMedia = [];
    var arregloTiposMedia = [];
    var indicesMediaActivos = [];
    let textsMedia = [];
    var numMedia = 0;
    const errorMsgElement = document.querySelector('span#errorMsg');
    $("#enviarFoto").hide();
    $("#retake").hide();
    $("#preloader").hide()
    let archivosTemp = [];
    let arregloImagenes = [];
    let arregloTipos = [];
    let indicesActivos = [];
   
    var archivoFocused = -1;
    var mediaFocused = -1;
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
            $("#previa").hide()
            $("#preloader").removeClass("inactive");
            $("#preloader").addClass("active");
            $("#div-preloader").show();
            $('#preloader').show();
            $("#div-docs").hide();
            $("#pages-count").hide();
            setTimeout(function () {

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
                                $('#add-files li img').each(function () {
                                    $(this).css("border", "none");
                                })
                                $("#add-files li div").each(function () {
                                    $(this).css("border", "none");
                                })
                                var li = "<li id='arch-" + contArchivos + "' style='display:inline; width: 8rem; height:8rem; margin-right: 0.5rem; position:relative;z-index:0'><a href='#' data-pdf='active' data-name='" + file.name + "' class='material-icons quitar' style='z-index:1;position:absolute;right:0'>close</a><img class='carrusel responsive-img'  data-pdf='active' data-pages='" + pdf.numPages + "'  style='border:1px solid #1b9a59; width: 8rem; height: 8rem;' src='" + image + "' /></li>";
                                indicesActivos.push(contArchivos);
                                $("#add-files").append(li);
                                contArchivos++;
                                numArchivos++;
                                archivoFocused = numArchivos - 1;
                            });
                        });
                    }, function (reason) {
                        // PDF loading error
                        console.error(reason);
                    });
                };
                fileReader.readAsArrayBuffer(file);
                arregloTipos.push("pdf");

                $("#preloader").removeClass("active")
                $("#preloader").addClass("inactive")
                $("#div-preloader").hide()
                $("#previa").show();
                $("#pages-count").show();
            }, 2000);
        }
        else if (file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            $("#preloader").removeClass("inactive")
            $("#preloader").addClass("active");
            $("#previa").hide()
            $("#div-docs").hide();
            $("#pages-count").hide()
            $("#preloader").show()
            $("#div-preloader").show()
            setTimeout(function () {
                $("#div-preloader").hide()
                $("#preloader").hide();
                $("#div-docs").show();
                $("#img-doc").text("description");
                $("#img-doc").css("color", "blue");
                $("#name-doc").text(file.name);
                $('#add-files li img').each(function () {
                    $(this).css("border", "none");
                })
                $("#add-files li div").each(function () {
                    $(this).css("border", "none");
                })
                var imagen = "data:image/png;base64,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";
                var li = "<li id='arch-" + contArchivos + "' style='display:inline; width: 8rem; height:8rem; margin-right: 0.5rem; position:relative;z-index:0'><a href='#' data-pdf='inactive' data-name='" + file.name + "'  class='material-icons quitar' style='z-index:1;position:absolute;right:0'>close</a><img class='carrusel responsive-img' data-pdf='inactive'  data-name='" + file.name + "' style=' border:1px solid #1b9a59; padding:2rem;  width: 8rem; height: 8rem; background-color:white;' src='" + imagen + "' /></li>";
                $("#add-files").append(li);
                arregloImagenes.push(imagen);
                indicesActivos.push(contArchivos);
                contArchivos++;
                numArchivos++;
                arregloTipos.push("word");
                archivosTemp.push(file);
                archivoFocused = contArchivos - 1;
            }, 2000);
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
                var index = indicesActivos[$("#" + id).index()];
                var indexPosicion = $("#" + id).index();
                var indiceSelec = indicesActivos[indicesActivos.length - 1];
                indicesActivos.splice(indexPosicion, 1);
                var indexEnf;
                if ((indexPosicion + 1) >= indicesActivos.length)
                    indexEnf = indicesActivos[indicesActivos.length - 1];
                else {
                    indexEnf = indicesActivos[indexPosicion]
                }
                var fileName = $("#arch-" + indexEnf).find("a").attr("data-name")
                $("#" + id).animate({ width: 0, "padding-left": 0, "padding-right": 0, "margin-left": 0, "margin-right": 0 }, 500, function () {
                    $(this).remove();
                    $("#" + id).remove();
                })
                arregloImagenes.splice(indexPosicion, 1);
                arregloTipos.splice(indexPosicion, 1);
                archivosTemp.splice(indexPosicion, 1);


                var data = $("#" + id).find("a").attr("data-pdf");
                if (indexPosicion == arregloImagenes.length) {
                    archivoFocused = index;
                    indexPosicion = arregloImagenes.length - 1;
                    if (arregloImagenes.length == 1) {
                        indexPosicion = 0;
                    }
                    else if (indexPosicion >= arregloImagenes.length) {
                        indexPosicion = arregloImagenes.length - 1;
                    }
                    
                    $("#arch-" + indicesActivos[indexPosicion]).find("img").css("border", "1px solid #1b9a59");
                    if (arregloTipos[arregloTipos.length - 1] == "pdf") {
                        var canvas = document.getElementById("previa");
                        var ctx = canvas.getContext("2d");
                        var image = new Image();
                        image.onload = function () {
                            ctx.drawImage(image, 0, 0);
                        };
                        image.src = arregloImagenes[arregloImagenes.length - 1];
                        $("#div-docs").hide();
                        $("#previa").show();
                        var numPag = $("#arch-" + indicesActivos[indexPosicion]).find("img").attr("data-pages");
                        $("#pages-count").text(numPag + " Pages");
                        $("#pages-count").show()

                    }
                    else if (arregloTipos[arregloTipos.length - 1] == "word") {
                        $("#previa").hide();
                        $("#pages-count").hide()
                        $("#div-docs").show();
                        $("#img-doc").text("description")
                        $("#name-doc").text(fileName)

                    }
                }
                else if (archivoFocused == index && archivoFocused != arregloImagenes.length) {
                    if (arregloImagenes.length == 1) {
                        indexPosicion = 0;
                    }
                    else if (indexPosicion >= arregloImagenes.length) {
                        indexPosicion = arregloImagenes.length - 1;
                    }
                   
                    $("#arch-" + indicesActivos[indexPosicion]).find("img").css("border", "1px solid #1b9a59");
                    archivoFocused = index;

                    if (arregloTipos[indexPosicion] == "pdf") {
                        $("#previa").show();
                        $("#div-docs").hide();
                        var canvas = document.getElementById("previa");
                        var ctx = canvas.getContext("2d");
                        var image = new Image();
                        image.onload = function () {
                            ctx.drawImage(image, 0, 0);
                        };
                        image.src = arregloImagenes[indexPosicion];
                        var numPag = $("#arch-" + (indicesActivos[indexPosicion])).find("img").attr("data-pages");
                        $("#pages-count").text(numPag + " Pages");
                        $("#pages-count").show()
                    }
                    else if (arregloTipos[indexPosicion] == "word") {
                        $("#previa").hide();
                        $("#pages-count").hide()
                        $("#div-docs").show();
                        $("#img-doc").text("description")
                        $("#name-doc").text(fileName)
                    }
                }
                if (numArchivos > 0) { numArchivos--; }
                if (numArchivos == 0) {
                    var modal = $("#modal-documents");
                    var instance = M.Modal.getInstance(modal);
                    instance.close();
                    numArchivos == 0;
                }
            }
            else if (HaHechoClick == "IMG" && clase == "carrusel responsive-img") {
                archivoFocused = indicesActivos[$("#" + id).index()];
                var canvas = document.getElementById("previa");
                var ctx = canvas.getContext("2d");
                var data = $("#" + id).find("img").attr("data-pdf");
                $('#add-files li img').each(function () {
                    $(this).css("border", "none");
                })
                if (data == "active") {
                    var image = new Image();
                    image.onload = function () {
                        ctx.drawImage(image, 0, 0);
                    };
                    var imagen = arregloImagenes[$("#" + id).index()];
                    image.src = imagen
                    $("#" + id).find("img").css("border", "1px solid #1b9a59");
                    var paginas = $("#" + id).find("img").attr("data-pages");
                    $("#pages-count").text(paginas + " Pages");
                    $("#div-docs").hide();
                    $("#previa").show();
                    $("#pages-count").show();
                }
                else if (data == "inactive") {
                    var nombre = $("#" + id).find("a").attr("data-name");
                    $("#previa").hide();
                    $("#pages-count").hide()
                    $("#div-docs").show();
                    $("#img-doc").text("description");
                    $("#img-doc").css("color", "blue");
                    $("#name-doc").text(nombre);
                    $("#" + id).find("img").css("border", "1px solid #1b9a59");
                }

            }
            else if (HaHechoClick == "IMG" && clase == "carrusel responsive-img media") {
                mediaFocused = indicesMediaActivos[$("#" + id).index()];
                var canvas = document.getElementById("previa");
                var ctx = canvas.getContext("2d");
                var data = $("#" + id).find("img").attr("data-media");
                $('#add-media li img').each(function () {
                    $(this).css("border", "none");
                })
                if (data == "imagen") {
                    $("#media-frame-video").hide();
                    $("#media-frame-img").attr("src", arregloMedia[$("#" + id).index()])
                    $("#media-frame-img").show();
                    $("#" + id).find("img").css("border", "1px solid #1b9a59");
                }
                else if (data == "video") {
                    $("#media-frame-img").hide();
                    $("#media-frame-video").attr("src", arregloMedia[$("#" + id).index()])
                    $("#media-frame-video").show();
                    $("#" + id).find("img").css("border", "1px solid #1b9a59");
                }
            }
            else if (HaHechoClick == "A" && clase == "material-icons quitar-media") {
                var index = indicesMediaActivos[$("#" + id).index()];
                var indexPosicion = $("#" + id).index();
                var indiceSelec = indicesMediaActivos[indicesMediaActivos.length - 1];
                indicesMediaActivos.splice(indexPosicion, 1);
                var indexEnf;
                if ((index + 1) >= indicesMediaActivos.length)
                    indexEnf = indicesMediaActivos[indicesMediaActivos.length - 1];
                else {
                    indexEnf = indicesMediaActivos[index + 1]
                }
                $("#" + id).animate({ width: 0, "padding-left": 0, "padding-right": 0, "margin-left": 0, "margin-right": 0 }, 500, function () {
                    $(this).remove();
                    $("#" + id).remove();
                })
                arregloMedia.splice(indexPosicion, 1);
                arregloTiposMedia.splice(indexPosicion, 1);


                if (index == arregloMedia.length) {
                    mediaFocused = index
                    $("#media-" + indicesMediaActivos[indexPosicion]).find("img").css("border", "1px solid #1b9a59");
                    if (arregloMedia.length == 1) {
                        indexPosicion = 0;
                    }
                    else if (indexPosicion >= arregloMedia.length) {
                        indexPosicion = arregloMedia.length - 1;
                    }
                    if (arregloTiposMedia[arregloTiposMedia.length - 1] == "imagen") {
                        $("#media-frame-img").attr("src", arregloMedia[arregloMedia.length - 1])
                        $("#media-frame-video").hide();
                        $("#media-frame-img").show();
                    }
                    else if (arregloTiposMedia[arregloTiposMedia.length - 1] == "video") {
                        $("#media-frame-video").attr("src", arregloMedia[arregloMedia.length - 1])
                        $("#media-frame-img").hide();
                        $("#media-frame-video").show();
                    }
                }
                else if (mediaFocused == index && mediaFocused != arregloMedia.length) {
                    $("#media-" + indicesMediaActivos[indexPosicion]).find("img").css("border", "1px solid #1b9a59");
                    mediaFocused = index
                    if (arregloMedia.length == 1) {
                        indexPosicion = 0;
                    }
                    else if (indexPosicion >= arregloMedia.length) {
                        indexPosicion = arregloMedia.length - 1;
                    }
                    if (arregloTiposMedia[indexPosicion] == "imagen") {
                        $("#media-frame-img").attr("src", arregloMedia[indexPosicion])
                        $("#media-frame-video").hide();
                        $("#media-frame-img").show();
                    }
                    else if (arregloTiposMedia[indexPosicion] == "video") {
                        $("#media-frame-video").attr("src", arregloMedia[indexPosicion])
                        $("#media-frame-img").hide();
                        $("#media-frame-video").show();

                    }
                }
                if (numMedia > 0) { numMedia--; }
                if (numMedia == 0) {
                    var modal = $("#modal-media");
                    var instance = M.Modal.getInstance(modal);
                    instance.close();
                    numMedia == 0;
                }
            }
        }
        // Añadimos el elemento al array de elementos
        //  ElementosClick.push(HaHechoClick);
        // Una prueba con salida en consola
        console.log("Contenido sobre lo que ha hecho click: " + HaHechoClick);
        console.log(clase);
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
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:0.5rem; padding-bottom:1rem; position:relative;'><div style='word-wrap: break-word;'><img style='width:100%' class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");


                            }
                        }
                        else {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem;word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:0.5rem; padding-bottom:1rem; position:relative;'><div style='word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");


                            }
                        }
                        colaCargarRecibido = false;
                        colaCargarEnviado = true;
                    }
                    else if (data[i].emisor == $("#destinoFocused").val() && data[i].receptor == $("#telSession").val() && !colaCargarRecibido) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:0.5rem; padding-bottom:1rem; position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /></div></div></div>");
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-left:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-left:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");


                            }
                        }
                        else {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:2rem; position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Imagen")
                                $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='margin-left:0.5rem;border-radius:0 2px 2px 2px; max-width:18rem; width:auto; float:left; padding-left:0.5rem; padding-right:0.5rem; position:relative; padding-bottom:1rem;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' />" + data[i].contenido + "</div></div></div>");
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-left:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row recibidos' data-state='" + data[i].estado + "' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-left:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");


                            }
                        }
                    }
                    else if (colaCargarEnviado && data[i].emisor == $("#telSession").val() && data[i].receptor == $("#destinoFocused").val()) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='bottom:0; position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;bottom:0'>done_all</i></div></div></div>");
                                else
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='bottom:0; position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>done_all</i></div></div></div>");

                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                            }

                            // $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'><div class='green lighten-3' role='button' style='padding:1rem;'>" + data[i].ruta + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");

                        }
                        else if (data[i].estado == "Enviado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative; bottom:0'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div></div>");
                                else
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div>");

                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta)
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");


                            }
                            // $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'><div class='green lighten-3' style='padding:1rem;'>" + data[i].ruta + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                        }
                        else if (data[i].estado == "Visto") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; word-wrap: break-word;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative; bottom:0'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>done_all</i></div></div></div>");
                                else
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative; padding-bottom:1rem; word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>done_all</i></div></div></div>");

                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta);
                                var esPdf = /.pdf$/.test(data[i].ruta);
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div  class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                            }
                            //   $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative; role='button' word-wrap: break-word;'>" + data[i].ruta + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");

                        }
                        colaCargarEnviado = false;
                        colaCargarRecibido = true;
                    }
                    else if (data[i].emisor == $("#telSession").val() && data[i].receptor == $("#destinoFocused").val() && !colaCargarEnviado) {
                        if (data[i].estado == "Entregado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative; bottom:0;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>done_all</i></div></div></div></div>");
                                else {
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>done_all</i></div></div></div></div>");

                                }
                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta)
                                var esPdf = /.pdf$/.test(data[i].ruta)
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'   style='cursor:pointer; padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div  style='display:table'><div role='button' class='download' data-id='../../files/" + data[i].ruta + "' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "'  style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'  style='cursor:pointer;padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button'  style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                            }
                        }
                        else if (data[i].estado == "Enviado") {
                            if (data[i].tipo == "Texto")
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i></div></div>");
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem; position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;bottom:0'>check</i></div></div></div></div>");
                                else
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem; padding-bottom:1rem; position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div></div>");

                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta)
                                var esPdf = /.pdf$/.test(data[i].ruta)
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'   style='cursor:pointer; padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div  style='display:table'><div role='button' class='download' data-id='../../files/" + data[i].ruta + "' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "'  style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'  style='cursor:pointer;padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button'  style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                            }


                        }
                        else if (data[i].estado == "Visto") {
                            if (data[i].tipo == "Texto") {
                                $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; max-width:18rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                                // $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;'>" + data[i].contenido + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");
                            }
                            else if (data[i].tipo == "Imagen") {
                                if (data[i].contenido != "")
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='bottom:0;position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>done_all</i></div></div></div></div>");
                                else
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;  padding-bottom:1rem;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + data[i].ruta + "' /><div style='bottom:0;position:relative;'>" + data[i].contenido + "<i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>done_all</i></div></div></div></div>");

                            }
                            else if (data[i].tipo == "Documento") {
                                var esDocx = /.docx$/.test(data[i].ruta)
                                var esPdf = /.pdf$/.test(data[i].ruta)
                                if (esDocx)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'   style='cursor:pointer; padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div  style='display:table'><div role='button' class='download' data-id='../../files/" + data[i].ruta + "' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                                else if (esPdf)
                                    $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "'  style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3'  style='cursor:pointer;padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px;  word-wrap: break-word;'><div style='display:table'><div class='download' data-id='../../files/" + data[i].ruta + "' role='button' style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + data[i].ruta + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                            }

                            //  $("#messages-list").append("<div class='row enviados state' data-state='" + data[i].estado + "' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:2rem;position:relative;'><div style='margin-right: 1rem; word-wrap: break-word;' role='button'>" + data[i].ruta + "</div><i class='tiny material-icons' style='color:blue;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i></div></div>");

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
                else if (typing.kind == "Documento") {
                    var esDocx = /.docx/.test(typing.url)
                    var esPdf = /.pdf/.test(typing.url)
                    if (esDocx)
                        $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + typing.url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                    else if (esPdf)
                        $("#messages-list").append("<div class='row recibidos' style='width:100%;'><span width='8' height='13' style='float:left'><svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 6 17' width='8' height='17'><path opacity='0' class='z-depth-2' fill='#ffffff' d='M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z'></path><path class='z-depth-2' fill='#ffffff' d='M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z'></path></svg></span><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class=grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + typing.url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                }
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
                else if (typing.kind == "Documento") {
                    var esDocx = /.docx/.test(typing.url)
                    var esPdf = /.pdf/.test(typing.url)
                    if (esDocx)
                        $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + typing.url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                    else if (esPdf)
                        $("#messages-list").append("<div class='row recibidos' style='width:100%;'><div class='white' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:left;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='grey lighten-5' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + typing.url + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");

                }
            }
            $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);

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

    $("#send-files").click(function () {
        var formData = new FormData();
        for (var i = 0; i < archivosTemp.length; i++) {
            formData.append("archivo-" + i, archivosTemp[i]);
        }
        $.ajax({
            url: '/Dash/EnviarMultiplesArchivos',
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) { },
            error: function (err) { console.log(err); alert(err) }
        });
        var destino = $("#destinoFocused").val()
        var yo = $("#telSession").val()
        var lista = [];
        for (var i = 0; i < archivosTemp.length; i++) {
            lista.push(archivosTemp[i].name);
        }
        $.ajax({
            url: '/Dash/IsConnected',
            method: "POST",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("XSRF-TOKEN",
                    $('input:hidden[name="RequestVerificationToken"]').val());
            },
            data:
            {
                tel: destino
            },
            success: function (data) {
                if (data == 1) {
                    for (var i = 0; i < lista.length; i++) {
                        var esDocx = /.docx$/.test(lista[i]);
                        var esPdf = /.pdf$/.test(lista[i]);
                        if (colaEnviado) {
                            if (esDocx)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                            else if (esPdf)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>done_all</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");
                            colaEnviado = false;
                        }
                        else {
                            if (esDocx)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                            else if (esPdf)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg></span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");
                            colaRecibido = true;
                        }
                    }
                    var vacio = true;

                    connection.invoke("EnviarArchivos", lista, destino, yo).catch(function (err) {
                        return alert(err.toString())
                        console.log('error al enviar');
                    })
                    var selectedLi = $("#li-" + destino);
                    $("#ul-izq").prepend(selectedLi);
                    $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                    //$("#ult-" + user).css("font-style", "italic");
                    //$("#ult-" + user).html("<i class='tiny material-icons'>done_all</i>Sent an image");

                }
                else {
                    for (var i = 0; i < lista.length; i++) {
                        var esDocx = /.docx$/.test(lista[i])
                        var esPdf = /.pdf$/.test(lista[i])
                        if (colaEnviado) {
                            if (esDocx)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                            else if (esPdf)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");
                            colaEnviado = false;
                        }
                        else {
                            if (esDocx)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' role='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>DOCX</div></div></div>");
                            else if (esPdf)
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right;padding-top:0.2rem; padding-bottom:1rem; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div class='light-green lighten-3' button='button' style='padding: 0.4rem;margin-bottom:0.1rem;border:0.5px solid #e0e0e0;border-radius:1px; word-wrap: break-word;'><div style='display:table'><div style='vertical-align:middle;display:table-cell; padding-right:0.15rem'>" + lista[i] + "</div><span style='display:table-cell; padding-left:0.15rem'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34' width='34' height='34'><path fill='currentColor' d='M17 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S2 25.3 2 17 8.7 2 17 2m0-1C8.2 1 1 8.2 1 17s7.2 16 16 16 16-7.2 16-16S25.8 1 17 1z'></path><path fill='currentColor' d='M22.4 17.5h-3.2v-6.8c0-.4-.3-.7-.7-.7h-3.2c-.4 0-.7.3-.7.7v6.8h-3.2c-.6 0-.8.4-.4.8l5 5.3c.5.7 1 .5 1.5 0l5-5.3c.7-.5.5-.8-.1-.8z'></path></svg><span></div></div><i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0;'>check</i><div style='font-size:x-small;position:absolute;z-index:1;left:0.5rem; bottom:0;'>PDF</div></div></div>");
                            colaRecibido = true;
                        }

                    }
                    connection.invoke("SendDisconnectedFiles", lista, destino, yo).catch(function (err) {
                        return alert(err.toString())
                        console.log('error al enviar');
                    })
                    $("#mensaje").val('');
                    var selectedLi = $("#li-" + destino);
                    $("#ul-izq").prepend(selectedLi);;
                    //$("#ult-" + user).html("<i class='tiny material-icons'>check</i>" + "Sent an image");
                }
                $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                arregloImagenes = [];
                archivosTemp = [];
                arregloTipos = [];
                archivoFocused = -1;
                indicesActivos = [];
                contArchivos = 0;
                numArchivos = 0;
                var modal = $("#modal-documents");
                var instance = M.Modal.getInstance(modal);
                instance.close();

            }
        });
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
                            if (mensaje != "")
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative; bottom:0;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>check</i></div></div></div></div>");
                            else {
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div></div>");

                            }
                            colaEnviado = false;
                        }
                        else {
                            if (mensaje != "")
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative; bottom:0;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>check</i></div></div></div></div>");
                            else {
                                $("#messages-list").append("<div class='row enviados state' data-state='Entregado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div></div>");
                            }
                            colaRecibido = true;

                        }
                        var vacio = true;

                        connection.invoke("SendImage", user, imageURL, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#texto-imagen").val('');
                        var selectedLi = $("#li-" + user);
                        $("#ul-izq").prepend(selectedLi);
                        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
                        $("#ult-" + user).css("font-style", "italic");
                        $("#ult-" + user).html("<i class='tiny material-icons'>done_all</i>Sent an image");

                    }
                    else {
                        if (colaEnviado) {
                            if (mensaje != "")
                                $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative; bottom:0;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>check</i></div></div></div></div>");
                            else {
                                $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><span width='8' height='13' style='float:right'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 17' width='8' height='17'><path opacity='.13' d='M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z'></path><path fill='#dcedc8' d='M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z'></path></svg></span><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div></div>");

                            }
                            colaEnviado = false;
                        }
                        else {
                            if (mensaje != "")
                                $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative; bottom:0;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem; bottom:0'>check</i></div></div></div></div>");
                            else {
                                $("#messages-list").append("<div class='row enviados state' data-state='Enviado' style='width:100%;'><div class='light-green lighten-4' style='border-radius:2px 0 2px 2px; margin-right:0.5rem; max-width:18rem; width:auto; float:right; padding-left: 0.5rem; padding-right:0.5rem;padding-bottom:1rem;position:relative;'><div style=' word-wrap: break-word;'><img class='responsive-img' src='../../files/" + imageURL + "' /><div style='position:relative;'>" + mensaje + "<i class='tiny material-icons' style='color:grey;margin-left:1rem; position:absolute; z-index:1; right:0.5rem;'>check</i></div></div></div></div>");
                            }
                            colaRecibido = true;

                        }
                        connection.invoke("SendDisconnectedImage", user, imageURL, mensaje).catch(function (err) {
                            return alert(err.toString())
                            console.log('error al enviar');
                        })
                        $("#mensaje").val('');
                        var selectedLi = $("#li-" + user);
                        $("#ul-izq").prepend(selectedLi);
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

                        $("#ul-izq").prepend(selectedLi);
                        var vacio = true;
                        $("#ult-" + user).html("<i class='tiny material-icons'>check</i>" + mensaje);

                    }
                }
            });
        }
    });
    $("div").on("click", ".download", function () {
        window.location = $(this).attr("data-id");
    })
    $("#closeModalMedia").click(function () {
        var modal = $("#modal-media");
        var instance = M.Modal.getInstance(modal);
        instance.close();
    })
    $("#add-media-btn").click(function () {
        textsMedia.push($("#text_media").val());
        $("#input-photos").click();
    })
    $("#input-photos").on("change", function (e) {
        $("#div-media-container").hide();
        $("#preloader-media").addClass("active");
        $("#preloader-media").removeClass("inactive");
        $("#div-preloader-media").show();
        $("#preloader-media").show();
        var modal = $("#modal-media");
        var instance = M.Modal.getInstance(modal);
        instance.open();
        var file = e.target.files[0];
        var tipo = "";
        if (file.type == "image/jpeg" || file.type == "image/png")
            tipo = "imagen";
        else
            tipo = 'video';
        $("#div-media-container").hide();

        $("#div-preloader-media").hide();
        $("#preloader-media").removeClass("active");
        $("#preloader-media").addClass("inactive");
        $("#preloader-media").hide();
        $("#div-media-container").show();
        var archivoMedia = URL.createObjectURL(e.target.files[0])

        $('#add-media li img').each(function () {
            $(this).css("border", "none");
        })
        var li = "";
        if (tipo == "imagen") {
            $("#media-frame-img").attr("src", archivoMedia)
            $("#media-frame-img").css("display", "block");
            $("#media-frame-video").hide();
            li = "<li id='media-" + contMedia + "' style='display:inline; width: 8rem; height:8rem; margin-right: 0.5rem; position:relative;z-index:0'><a href='#' data-media='imagen' data-name='" + file.name + "'  class='material-icons quitar-media' style='z-index:1;position:absolute;right:0'>close</a><img class='carrusel responsive-img media' data-media='imagen'  data-name='" + file.name + "' style=' border:1px solid #1b9a59; padding:2rem;  width: 8rem; height: 8rem; background-color:white;' src='" + archivoMedia + "' /></li>";
            $("#add-media").append(li);
            indicesMediaActivos.push(contMedia);
            contMedia++;
        }
        else if (tipo == "video") {
            $("#media-frame-img").hide();
            $("#media-frame-video").show();
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var blob = new Blob([fileReader.result], { type: file.type });
                var url = URL.createObjectURL(blob);
                var videoNuevo = document.getElementById('media-frame-video');
                videoNuevo.videoHeight = 1280;
                videoNuevo.videoWidth = 720;
                var timeupdate = function () {
                    if (snapImage()) {
                        videoNuevo.removeEventListener('timeupdate', timeupdate);
                        videoNuevo.pause();
                    }
                };
                video.addEventListener('loadeddata', function () {
                    if (snapImage()) {
                        videoNuevo.removeEventListener('timeupdate', timeupdate);
                    }
                });
                var snapImage = function () {
                    var canvasTemp = document.createElement('canvas');
                    canvasTemp.width = videoNuevo.videoWidth;
                    canvasTemp.height = videoNuevo.videoHeight;
                    canvasTemp.getContext('2d').drawImage(videoNuevo, 0, 0, canvasTemp.width, canvasTemp.height);
                    var image = canvasTemp.toDataURL();
                    console.log(videoNuevo.videoWidth);
                    console.log(videoNuevo.videoHeight);
                    console.log(image);

                    var success = image.length > 100000;
                    console.log(success)
                    if (success) {
                        li = "<li id='media-" + contMedia + "' style='display:inline; width: 8rem; height:8rem; margin-right: 0.5rem; position:relative;z-index:0'><a href='#' data-media='video' data-name='" + file.name + "'  class='material-icons quitar-media' style='z-index:1;position:absolute;right:0'>close</a><img class='carrusel responsive-img media' data-media='video'  data-name='" + file.name + "' style=' border:1px solid #1b9a59; width: 8rem; height: 8rem; background-color:white;' src='" + image + "' /></li>";
                        indicesMediaActivos.push(contMedia);
                        contMedia++;

                        $("#add-media").append(li);
                        console.log(li)
                        URL.revokeObjectURL(url);
                    }
                    return success;
                };
                videoNuevo.addEventListener('timeupdate', timeupdate);
                videoNuevo.preload = 'metadata';
                videoNuevo.src = url;
                // Load video in Safari / IE11
                videoNuevo.muted = true;
                videoNuevo.playsInline = true;
                videoNuevo.play();
            };
            fileReader.readAsArrayBuffer(file);

        }

        arregloMedia.push(archivoMedia);
        arregloTiposMedia.push(tipo);
        numMedia++;
        mediaFocused = contMedia - 1;
    })
})
function quitar() {
    var a = this.tagName;
    var li = a.parentNode;
    var id = li.id;
    $("#" + id).remove();
}
