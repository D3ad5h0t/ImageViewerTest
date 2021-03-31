using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ImageViewerTest.ViewModels;

namespace ImageViewerTest.ViewModes
{
    public class FoldersViewModel
    {
        public IEnumerable<Folder> Folders { get; set; }

        public int BlackListCount { get; set; }

        public PageInfo PageInfo { get; set; }
    }
}
