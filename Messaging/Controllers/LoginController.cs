using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Messaging.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Messaging.Controllers
{
    public class LoginController : Controller
    {
        private readonly chatwebContext context;
        
        public LoginController(chatwebContext _context)
        {
            context = _context;
        }
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Auth(string phone, string password)
        {  
            var login = context.Personas.Where(p => p.Phone == phone).Where(p => p.Pass == password).Count();
            if (login > 0)
            {
                var persona = context.Personas.Where(p => p.Phone == phone).First();
                HttpContext.Session.SetString("telefono", phone);
                HttpContext.Session.SetString("nombre", persona.FirstName);
                return RedirectToAction("Home", "Dash");
            }
            else
            {
                TempData["message"] = "The username or the password is incorrect!";
                return View("~/Views/Login/Login.cshtml");
            }

        }
        
    }
}