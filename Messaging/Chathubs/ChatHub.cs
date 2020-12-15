using Messaging.Migrations;
using Messaging.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections;
using System.Text.RegularExpressions;

namespace Messaging.Chathubs
{
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            string telefono = Context.GetHttpContext().Request.Query["user"];
            string id = Context.ConnectionId;
            var context = new chatwebContext();
            var existe = context.Conectados.Where(x => x.Telefono == telefono).Count();
            if (existe == 0)
            {
                Conectado cn = new Conectado();
                cn.Telefono = telefono;
                cn.IdConexion = id;
                cn.UltimaConexion = DateTime.Now.ToString();
                cn.ConectadoState = 1;
                context.Conectados.Add(cn);
                context.SaveChanges();
            }
            else
            {
                var usuario = context.Conectados.Where(x => x.Telefono == telefono).First();
                var mensajes = context.Mensajes.Where(x => x.Receptor == telefono).Where(x => x.Estado == "Enviado").ToList();

                foreach (var msn in mensajes)
                {
                    msn.Estado = "Entregado";
                    context.SaveChanges();
                }
                Typing typing = new Typing { Message = "Connected", State = "Unread", Kind = "Texto" , Url = ""};
                context.Conectados.Remove(usuario);
                context.SaveChanges();
                Conectado cn = new Conectado();
                cn.Telefono = telefono;
                cn.IdConexion = id;
                cn.UltimaConexion = DateTime.Now.ToString();
                cn.ConectadoState = 1;
                context.Conectados.Add(cn);
                context.SaveChanges();
                Typing tp = new Typing { Message = "", State = "Just-Online", Kind = "Texto", Url ="" };
                Clients.All.SendAsync("ReceiveMessage", telefono, tp);
                Clients.All.SendAsync("ReceiveMessage", telefono, typing);

            }
            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception exception)
        {
            var context = new chatwebContext();
            var idConexion = Context.ConnectionId;
            var conexion = context.Conectados.Where(x => x.IdConexion == idConexion).First();
            conexion.ConectadoState = 0;
            conexion.UltimaConexion = DateTime.Now.ToString();
            context.SaveChanges();
            Typing tp = new Typing { Message = "Last " + DateTime.Now.ToString(), State = "Just-Offline" , Kind = "Texto", Url = "" };
            Clients.All.SendAsync("ReceiveMessage", conexion.Telefono, tp);
            return base.OnDisconnectedAsync(exception);
        }
        public Task SendPrivateMessage(string user, string message)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == user).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var persona = context.Personas.Where(x => x.Phone == remitente.Telefono).First();
            var mensaje = new Mensaje();
            mensaje.Emisor = remitente.Telefono;
            mensaje.Receptor = destino.Telefono;
            mensaje.FechaEnviado = DateTime.Now.ToString();
            mensaje.Hora = DateTime.Now.ToShortTimeString();
            mensaje.Contenido = message;
            mensaje.Estado = "Entregado";
            mensaje.Tipo = "Texto";
            context.Mensajes.Add(mensaje);
            Typing tp = new Typing { Message = message, State = "Sent", Kind ="Texto", Url = "" };
            context.SaveChanges();
            return Clients.Client(destino.IdConexion).SendAsync("ReceiveMessage", persona.Phone, tp);
        }
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public Task TypingMessage(string tel, bool vacio)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == tel).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var persona = context.Personas.Where(x => x.Phone == remitente.Telefono).First();
            var message = "";
            if(vacio)
            {
                var mensajes = context.Mensajes.OrderByDescending(x => x.Id_Conversacion);
                foreach (var mens in mensajes)
                {
                    if (mens.Emisor == remitente.Telefono && mens.Receptor == tel || mens.Emisor == tel && mens.Receptor == remitente.Telefono)
                    {
                        message = mens.Contenido;
                        break;
                    }
                }
                var typing = new Typing { Message = message, State = "Online" , Kind="Texto", Url = ""};
                return Clients.Client(destino.IdConexion).SendAsync("ReceiveMessage", persona.Phone, typing);
            }
            else
            {
                message = "Typing...";
                var typing = new Typing { Message = message, State = "Typing...", Kind = "Texto", Url = ""};
                return Clients.Client(destino.IdConexion).SendAsync("ReceiveMessage", persona.Phone, typing);
            }



        }
        public Task Seen(string tel)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == tel).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var mensajes = context.Mensajes.Where(x => x.Receptor == remitente.Telefono).Where(x => x.Emisor == destino.Telefono).ToList();
            foreach (var men in mensajes)
            {
                men.Estado = "Visto";
                context.SaveChanges();
            }
            Typing typing = new Typing { Message = "Seen-Applied", State = "Seen", Kind = "Texto", Url = "" };
            return Clients.Client(destino.IdConexion).SendAsync("ReceiveMessage", remitente.Telefono, typing);
        }
        public void SendDisconnectedMessage(string user, string message)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == user).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var persona = context.Personas.Where(x => x.Phone == remitente.Telefono).First();
            var mensaje = new Mensaje();
            mensaje.Emisor = remitente.Telefono;
            mensaje.Receptor = destino.Telefono;
            mensaje.FechaEnviado = DateTime.Now.ToString();
            mensaje.Hora = DateTime.Now.ToShortTimeString();
            mensaje.Contenido = message;
            mensaje.Estado = "Enviado";
            mensaje.Tipo = "Texto";
            context.Mensajes.Add(mensaje);
            context.SaveChanges();
        }
        public Task VistoOnline(string user, string yo)
        {
            Typing typing = new Typing { Message = "Visto", State = "SeenOnline", Kind = "Texto", Url = "" };
            var context = new chatwebContext();
            var conectado = context.Conectados.Where(x => x.Telefono == user).First();
            var mensajes = context.Mensajes.Where(x => x.Emisor == user && x.Receptor == yo && x.Estado == "Entregado").ToList();
            foreach (var mensaje in mensajes)
            {
                mensaje.Estado = "Visto";
                context.SaveChanges();
            }
            return Clients.Client(conectado.IdConexion).SendAsync("ReceiveMessage", yo, typing);

        }
        public Task OpenChat(string desti, string user)
        {
            var context = new chatwebContext();
            var conectado = context.Conectados.Where(x => x.Telefono == desti).First();
            Typing typing = new Typing { Message = "Visto", State = "SeenOnline", Kind = "Texto", Url = "" };
            return Clients.Client(conectado.IdConexion).SendAsync("ReceiveMessage", user, typing);
        }
        public Task UnreadMessages(string user, string yo)
        {
            var destino = user;
            var remitente = yo;
            var context = new chatwebContext();
            var conectado = context.Conectados.Where(x => x.Telefono == destino).First();
            Typing typing = new Typing { Message = remitente, State = "ClickChat" };
            return Clients.Client(conectado.IdConexion).SendAsync("ReceiveMessage", yo, typing);
        }
        public Task SendImage(string desti, string url, string message)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == desti).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var persona = context.Personas.Where(x => x.Phone == remitente.Telefono).First();
            var mensaje = new Mensaje();

            mensaje.Emisor = remitente.Telefono;
            mensaje.Receptor = destino.Telefono;
            mensaje.FechaEnviado = DateTime.Now.ToString();
            mensaje.Hora = DateTime.Now.ToShortTimeString();
            mensaje.Contenido = message;
            mensaje.Estado = "Entregado";
            mensaje.Tipo = "Imagen";
            mensaje.Ruta = url;
            context.Mensajes.Add(mensaje);
            Typing tp = new Typing { Message = message, State = "Sent", Kind ="Imagen", Url = url };
            context.SaveChanges();
            return Clients.Client(destino.IdConexion).SendAsync("ReceiveMessage", persona.Phone, tp);
        }
        public void SendDisconnectedImage(string desti, string url, string message)
        {
            var context = new chatwebContext();
            var destino = context.Conectados.Where(x => x.Telefono == desti).First();
            var remitente = context.Conectados.Where(x => x.IdConexion == Context.ConnectionId).First();
            var persona = context.Personas.Where(x => x.Phone == remitente.Telefono).First();
            var mensaje = new Mensaje();
            mensaje.Emisor = remitente.Telefono;
            mensaje.Receptor = destino.Telefono;
            mensaje.FechaEnviado = DateTime.Now.ToString();
            mensaje.Hora = DateTime.Now.ToShortTimeString();
            mensaje.Contenido = message;
            mensaje.Estado = "Enviado";
            mensaje.Tipo = "Imagen";
            mensaje.Ruta = url;
            context.Mensajes.Add(mensaje);
            context.SaveChanges();
        }
        public void EnviarArchivos(List<string>archivos,string destino, string yo)
        {
            var context = new chatwebContext();
            var dest = context.Conectados.Where(x => x.Telefono == destino).First();
            var remitente = context.Conectados.Where(y => y.Telefono == yo).First();
            for (int i = 0; i < archivos.Count; i++)
            {
                var mensaje = new Mensaje
                {
                    Emisor = yo,
                    Receptor = destino,
                    FechaEnviado = DateTime.Now.ToString(),
                    Hora = DateTime.Now.ToShortTimeString(),
                    Estado = "Enviado",
                    Tipo = "Documento",
                    Ruta = archivos[i]  
                };
                context.Mensajes.Add(mensaje);
                context.SaveChanges();
                Typing typing = new Typing { Kind = "Documento", Message = "", State = "Sent", Url = archivos[i] };
                Clients.Client(dest.IdConexion).SendAsync("ReceiveMessage", yo, typing);
            }
            
            
        }
        public void EnviarMedia(List<string> archivos, List<string> mensajes, string destino, string yo)
        {
            var context = new chatwebContext();
            var dest = context.Conectados.Where(x => x.Telefono == destino).First();
            var remitente = context.Conectados.Where(y => y.Telefono == yo).First();
            for (int i = 0; i < archivos.Count; i++)
            {
                Regex esVideo = new Regex(@".mp4|.webm|.mkv|.wmv$");
                Regex esImagen = new Regex(@".png|.jpg|.jpeg$");
                Match match = esVideo.Match(archivos[i]);
                if (match.Success)
                {
                    var mensaje = new Mensaje
                    {
                        Emisor = yo,
                        Receptor = destino,
                        FechaEnviado = DateTime.Now.ToString(),
                        Hora = DateTime.Now.ToShortTimeString(),
                        Estado = "Enviado",
                        Tipo = "Imagen",
                        Ruta = archivos[i],
                        Contenido = mensajes[i]
                    };
                    context.Mensajes.Add(mensaje);
                    context.SaveChanges();
                    Typing typing = new Typing { Kind = "Imagen", Message = mensajes[i], State = "Sent", Url = archivos[i] };
                    Clients.Client(dest.IdConexion).SendAsync("ReceiveMessage", yo, typing);
                }
                else
                {
                    match = esImagen.Match(archivos[i]);
                    if (match.Success)
                    {
                        var mensaje = new Mensaje
                        {
                            Emisor = yo,
                            Receptor = destino,
                            FechaEnviado = DateTime.Now.ToString(),
                            Hora = DateTime.Now.ToShortTimeString(),
                            Estado = "Enviado",
                            Tipo = "Video",
                            Ruta = archivos[i],
                            Contenido = mensajes[i]
                        };
                        context.Mensajes.Add(mensaje);
                        context.SaveChanges();
                        Typing typing = new Typing { Kind = "Video", Message = mensajes[i], State = "Sent", Url = archivos[i] };
                        Clients.Client(dest.IdConexion).SendAsync("ReceiveMessage", yo, typing);
                    }
                }
                

            }
        }
        public void SendDisconnectedFiles(List<string> archivos, string destino, string yo)
        {
            var context = new chatwebContext();
            var dest = context.Conectados.Where(x => x.Telefono == destino).First();
            var remitente = context.Conectados.Where(y => y.Telefono == yo).First();
            for (int i = 0; i < archivos.Count; i++)
            {
                var mensaje = new Mensaje
                {
                    Emisor = yo,
                    Receptor = destino,
                    FechaEnviado = DateTime.Now.ToString(),
                    Hora = DateTime.Now.ToShortTimeString(),
                    Estado = "Enviado",
                    Tipo = "Documento",
                    Ruta = archivos[i],

                };
                context.Mensajes.Add(mensaje);
                context.SaveChanges();              
            }
        }
        public void SendDisconnectedMedia(List<string> archivos, List<string>mensajes, string destino, string yo)
        {
            var context = new chatwebContext();
            var dest = context.Conectados.Where(x => x.Telefono == destino).First();
            var remitente = context.Conectados.Where(y => y.Telefono == yo).First();
            for (int i = 0; i < archivos.Count; i++)
            {
                Regex esVideo = new Regex(@".mp4|.webm|.mkv|.wmv$");
                Regex esImagen = new Regex(@".png|.jpg|.jpeg$");
                if (esVideo.IsMatch(archivos[i]))
                {
                    var mensaje = new Mensaje
                    {
                        Emisor = yo,
                        Receptor = destino,
                        FechaEnviado = DateTime.Now.ToString(),
                        Hora = DateTime.Now.ToShortTimeString(),
                        Estado = "Enviado",
                        Tipo = "Video",
                        Ruta = archivos[i],
                        Contenido = mensajes[i]
                        
                    };
                    context.Mensajes.Add(mensaje);
                    context.SaveChanges();
                }
                else {
                    if(esImagen.IsMatch(archivos[i]))
                    {
                        var mensaje = new Mensaje
                        {
                            Emisor = yo,
                            Receptor = destino,
                            FechaEnviado = DateTime.Now.ToString(),
                            Hora = DateTime.Now.ToShortTimeString(),
                            Estado = "Enviado",
                            Tipo = "Imagen",
                            Ruta = archivos[i],
                            Contenido = mensajes[i]
                        };
                        context.Mensajes.Add(mensaje);
                        context.SaveChanges();
                    }
                }
                
                
            }
        }
    }
}

