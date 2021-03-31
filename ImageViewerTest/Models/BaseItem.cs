 using System;
using System.Collections.Generic;
 using System.IO;
 using System.Linq;
using System.Threading.Tasks;

namespace ImageViewerTest.ViewModels
{
    public class BaseItem
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public long Size { get; set; }

        public string Type { get; set; }

        public DateTime Modified { get; set; }

        public string Icon { get; set; }
    }
}
