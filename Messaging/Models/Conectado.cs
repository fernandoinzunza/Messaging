using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Messaging.Models
{
    public class Conectado 
    {
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity), Key()]
        public string Telefono { get; set; }
        public string IdConexion { get; set; }
        public string UltimaConexion { get; set; }
        public int ConectadoState { get; set; }
    }
}
