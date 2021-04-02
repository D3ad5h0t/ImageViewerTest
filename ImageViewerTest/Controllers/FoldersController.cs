using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ImageViewerTest.Enums;
using ImageViewerTest.Helpers;
using ImageViewerTest.Services;
using ImageViewerTest.ViewModels;
using ImageViewerTest.ViewModes;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace ImageViewerTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoldersController : ControllerBase
    {
        private readonly IOptions<BasePathsOptions> config;
        private readonly IHostEnvironment appEnvironment;
        private List<Folder> folders = new List<Folder>();
        private int pageSize = 10;
        private BlackListService blackListService;

        public FoldersController(IHostEnvironment appEnvironment, IOptions<BasePathsOptions> config)
        {
            this.config = config;
            this.appEnvironment = appEnvironment;
            blackListService = new BlackListService(appEnvironment, config);
        }

        [HttpGet]
        public ActionResult<FoldersViewModel> Get(int page, int blacklistNumber)
        {
            if (page < 0 || blacklistNumber < 0)
            {
                return BadRequest();
            }

            folders = GetRootFolders(blacklistNumber);
            List<Folder> foldersPerPages = GetFolders(page);

            if (page < 1 || folders == null || (foldersPerPages != null && !foldersPerPages.Any()))
            {
                return NotFound();
            }

            PageInfo pageInfo = new PageInfo
            {
                PageNumber = page,
                PageSize = pageSize,
                TotalItems = folders.Count,
            };
            FoldersViewModel model = new FoldersViewModel
            {
                PageInfo = pageInfo,
                Folders = foldersPerPages,
                BlackListCount = blackListService.GetBlackList().Count
            };

            return Ok(model);
        }

        private List<Folder> GetFolders(int page)
        {
            List<Folder> list = folders.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return list;
        }

        private List<Folder> GetRootFolders(int blacklistNumber)
        {
            List<Folder> rootFolders = new List<Folder>();
            string path = appEnvironment.ContentRootPath + config.Value.RootFolderPath;
            DirectoryInfo rootDir = new DirectoryInfo(path);

            var directories = rootDir.GetDirectories().ToList();
            directories = blackListService.FilterByBlackList(directories, blacklistNumber);

            foreach (var directory in directories)
            {
                rootFolders.Add(new Folder
                {
                    Name = directory.Name,
                    Size = GetSize(directory),
                    Modified = directory.CreationTime,
                    Type = ObjectType.Folder,
                    Url = directory.FullName
                });
            }

            return rootFolders;
        }

        private long GetSize(DirectoryInfo directory)
        {
            var files = Directory.GetFiles(directory.FullName);
            long bytes = 0;

            foreach (var file in files)
            {
                FileInfo info = new FileInfo(file);
                bytes += info.Length;
            }

            return bytes / 1024;
        }
    }
}
