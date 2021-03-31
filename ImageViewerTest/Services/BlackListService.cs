using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ImageViewerTest.Helpers;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Serilog;

namespace ImageViewerTest.Services
{
    public class BlackListService
    {
        private readonly List<string> blacklist;
        private readonly IOptions<BasePathsOptions> config;
        private readonly IHostEnvironment appEnvironment;

        public BlackListService(IHostEnvironment appEnvironment, IOptions<BasePathsOptions> config)
        {
            this.config = config;
            this.appEnvironment = appEnvironment;
        }

        public List<string> GetBlackList()
        {
            string path = appEnvironment.ContentRootPath + config.Value.BlackListPath;
            List<string> list = new List<string>();

            try
            {
                using (StreamReader reader = System.IO.File.OpenText(path))
                {
                    string folderName = "";
                    while ((folderName = reader.ReadLine()) != null)
                    {
                        list.Add(folderName);
                    }
                }

                return list;
            }
            catch (Exception e)
            {
                Log.Error(e.Message);
            }

            return null;
        }

        private List<string> GetPartOfBlackList(int count)
        {
            List<string> list = GetBlackList();
            return list.Take(count).ToList();
        }

        public List<DirectoryInfo> FilterByBlackList(List<DirectoryInfo> filteredList, int count)
        {
            List<string> list = GetPartOfBlackList(count);

            if (!list.Any())
            {
                return filteredList;
            }

            var regex = new Regex(string.Join("|", list.Select(x => "(" + Regex.Escape(x) + ")")), RegexOptions.Compiled | RegexOptions.Singleline);
            var newList = new List<DirectoryInfo>();

            foreach (var item in filteredList)
            {
                if (!regex.IsMatch(item.Name))
                {
                    newList.Add(item);
                }
            }

            return newList;
        }
    }
}
