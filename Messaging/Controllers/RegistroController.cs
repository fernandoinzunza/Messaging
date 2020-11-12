using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Messaging.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Messaging.Controllers
{
    public class RegistroController : Controller
    {
        private readonly chatwebContext context;

        public RegistroController(chatwebContext _context)
        {
            context = _context;
        }
        public IActionResult Nuevo()
        {
            return View();
        }
        [HttpPost]
        public JsonResult Crear(string first_name, string surname, string phone, string email, string pass, string confirm)
        {
            if (first_name == null)
            {
                return new JsonResult("Enter your First name!!");
            }
            else if (surname == null)
            {
                return new JsonResult("Enter your Surname!!");
            }
            else if (phone == null)
            {
                return new JsonResult("Enter your Phone!!");
            }
            else if (email == null)
            {
                return new JsonResult("Enter your Email!!");
            }
            else if (pass == null)
            {
                return new JsonResult("Enter your Password!!");
            }
            else if (confirm == null)
            {
                return new JsonResult("Confirm your password!!");
            }
            else if (confirm != pass)
            {
                return new JsonResult("The passwords don't match");
            }
            else
            {
                Personas pec = new Personas();
                pec.FirstName = first_name;
                pec.Surname = surname;
                pec.Phone = phone;
                pec.Email = email;
                pec.Pass = pass;
                context.Personas.Add(pec);
                context.SaveChanges();
                return new JsonResult("Te registraste con éxito!");
            }

        }
        public static string EncodePassword(string password)
        {
            byte[] salt;
            byte[] buffer2;
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, 0x10, 0x3e8))
            {
                salt = bytes.Salt;
                buffer2 = bytes.GetBytes(0x20);
            }
            byte[] dst = new byte[0x31];
            Buffer.BlockCopy(salt, 0, dst, 1, 0x10);
            Buffer.BlockCopy(buffer2, 0, dst, 0x11, 0x20);
            return Convert.ToBase64String(dst);
        }
    }
}