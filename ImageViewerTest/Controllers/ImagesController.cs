using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ImageViewerTest.Enums;
using ImageViewerTest.Helpers;
using ImageViewerTest.ViewModels;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace ImageViewerTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IOptions<BasePathsOptions> config;
        private readonly IHostEnvironment appEnvironment;

        public ImagesController(IHostEnvironment appEnvironment, IOptions<BasePathsOptions> config)
        {
            this.appEnvironment = appEnvironment;
            this.config = config;
        }

        [HttpGet]
        public ActionResult<List<Image>> Get(string folder)
        {
            var path = appEnvironment.ContentRootPath + config.Value.RootFolderPath + folder;
            if (string.IsNullOrWhiteSpace(folder) || !Directory.Exists(path))
            {
                return NotFound();
            }

            var images = GetImages(path, folder);
            if (images != null)
            {
                return Ok(images);
            }

            return BadRequest();
        }

        private List<Image> GetImages(string path, string folder)
        {
            List<Image> list = new List<Image>();
            var images = Directory.GetFiles(path).Where(file => file.EndsWith(".jpg") ||
                                                                 file.EndsWith(".png") ||
                                                                 file.EndsWith(".svg"))
                                                           .ToList();

            foreach (var image in images)
            {
                var file = new FileInfo(image);
                list.Add(new Image
                {
                    Name = file.Name,
                    Modified = file.LastWriteTime,
                    Size = file.Length / 1024,
                    Type = ObjectType.Image,
                    Extension = file.Extension,
                    Url = $"/root-folder/{folder}/{file.Name}"
                });
            }

            return list;
        }
    }
}
