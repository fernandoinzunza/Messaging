using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Messaging.Models
{
    public class Mensaje
    {
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity), Key()]
        public int Id_Conversacion { get; set; }
        public string Emisor { get; set; }
        public string Receptor { get; set; }
        public string FechaEnviado { get; set; }
        public string Hora { get; set; }
        public string Contenido { get; set; }
        public string Estado { get; set; }
        public string Tipo { get; set; }
        public string Ruta { get; set; }
    }
}
