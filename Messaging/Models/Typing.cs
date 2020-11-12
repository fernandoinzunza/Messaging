using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Messaging.Models
{
    public class Typing
    {
        public string Message { get; set; }
        public string State { get; set; }
        public string Kind { get; set; }
        public string Url { get; set; }
    }
}
