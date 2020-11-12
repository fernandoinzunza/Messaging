using Messaging.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
namespace Messaging.Controllers
{
    public class DashController : Controller
    {
        private readonly IWebHostEnvironment webHostEnvironment;
        public DashController(IWebHostEnvironment hostEnvironment)
        {
            webHostEnvironment = hostEnvironment;
        }
        public IActionResult Home()
        {
            var telefono = HttpContext.Session.GetString("telefono");

            var context = new chatwebContext();
            var conectados = context.Conectados.Where(x => x.Telefono != telefono).ToList();
            var personas = context.Personas.Where(x => x.Phone != telefono).ToList();
            ViewData["personas"] = personas;
            ViewData["conectados"] = conectados;
            var mensajes = context.Mensajes.OrderByDescending(x => x.Id_Conversacion).ToList();
            ViewData["mensajes"] = mensajes;
            return View();
        }
        [HttpPost]
        public JsonResult MostrarOnline(string telefono)
        {
            var context = new chatwebContext();
            var conectado = context.Conectados.Where(x => x.Telefono == telefono).First();
            var statusConexion = context.Conectados.Where(x => x.Telefono == telefono).First();
            var persona = context.Personas.Where(x => x.Phone == telefono).First();
            var mensajes = context.Mensajes.Where(x => x.Receptor == HttpContext.Session.GetString("telefono")).Where(x => x.Emisor == telefono).ToList();
            foreach (var men in mensajes)
            {
                men.Estado = "Visto";
                context.SaveChanges();
            }
            return Json(new { nombre = persona.FirstName, online = conectado.ConectadoState, ultima = statusConexion.UltimaConexion });
        }
        public JsonResult CargarMensajes(string telefono)
        {
            var context = new chatwebContext();
            string otroTel = telefono;
            string miTel = HttpContext.Session.GetString("telefono");
            var mensajes = context.Mensajes.OrderBy(x => x.Id_Conversacion).ToList();
            return Json(mensajes);
        }
        public int IsConnected(string tel)
        {
            var context = new chatwebContext();
            var conectado = context.Conectados.Where(x => x.Telefono == tel).Where(x => x.ConectadoState == 1).Count();
            return conectado;
        }
        [HttpPost]
        public void Visto(string destino)
        {
            var context = new chatwebContext();
            var mensajes = context.Mensajes.Where(x => x.Emisor == destino && x.Receptor == HttpContext.Session.GetString("telefono") && x.Estado == "Entregado").ToList();

            foreach (var m in mensajes)
            {
                m.Estado = "Visto";
                context.SaveChanges();
            }
            var conectado = context.Conectados.Where(x => x.Telefono == HttpContext.Session.GetString("telefono") && x.ConectadoState == 1).Count();
        }
        [HttpPost]
        public int MensajesNoLeidos(string telefono)
        {
            var context = new chatwebContext();
            var receptor = HttpContext.Session.GetString("telefono");
            var mensajesSinLeer = context.Mensajes.Where(x => x.Emisor == telefono && x.Receptor == receptor && x.Estado == "Entregado").Count();
            return mensajesSinLeer;
        }
        [HttpPost]
        public string EnviarImagenPrueba(string imagen)
        {
            var folderName = @"files\";
            var webRootPath = webHostEnvironment.WebRootPath;
            var newPath = Path.Combine(webRootPath, folderName);
            string file = Guid.NewGuid() + "-" + HttpContext.Session.GetString("telefono") + ".png";
            string fileNameWitPath = newPath + file;
          
            using (FileStream fs = new FileStream(fileNameWitPath, FileMode.Create))
            {
                using (BinaryWriter bw = new BinaryWriter(fs))
                {
                    byte[] data = Convert.FromBase64String(imagen);
                    bw.Write(data);
                    bw.Close();
                }
            }
            return file;
        }
    }
}