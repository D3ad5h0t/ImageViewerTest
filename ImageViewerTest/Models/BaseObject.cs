using System;
using ImageViewerTest.Enums;

namespace ImageViewerTest.Models
{
    public class BaseObject
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public long Size { get; set; }

        public ObjectType Type { get; set; }

        public DateTime Modified { get; set; }
    }
}
