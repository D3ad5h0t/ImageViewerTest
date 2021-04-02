# ImageViewerTest

*A simple App what's provide possibility to watch folders and images in server root folder*

## Backend

On the backend side, it was decided to use ASP.NET Core WEB API 3.1
- Controllers Folder: this folder contains controllers (MVC) for folder-viewer and image-viewer pages
- Models: contains C# classes describing the used in App models
- ViewModes: a folder with objects for transferring combined data between controllers ang pages
- Log: a folder with logs where events are written (used by Serilog)
- Helpers: folder with helper classes
- Services: contains C# classes describing server logic

## Frontend
 
On the frontend side, used static pages: HTML, CSS, TypeScript, JavaScript (minimum). To speed up the layout, used Bootstrap.
All .ts files located in the project's root folder - Scripts.
Scripts folder contains:
- models: contains .ts file describing the used in frontend models
- services: contains .ts files describing logic for pages

### In services:
- data-service: for receiving / sending data to the server
- loading-service: for visual display of loading pages and elements (in particular pictures)
- viewer-image-service: logic for image-viewer page
- viewer-table-service: logic for folders-viewer page

### wwwroot:
- root-folder: this folder contains folders with images that App displays
- black-list.txt - file with banned folders names
- pages: contains html pages files

## Logging
For logging uses Serilog library.
For logging tasks, was created a custom Middleware - LoggingMiddleware. Depending on the code, it writes:
- if Server Error - write Fatal Error
- if Client Error - write Error
- in other cases - Information

## Conclusion

In general, since one of the main requirements was to use third-party libraries to a minimum, ideally, without them, it was decided to abandon the idea of using webpack. Although, if the expansion of functionality continued, the module builder would greatly speed up the development process. There is a little logic in the controllers - in this particular case, it makes no sense to move it into separate classes, although, again, if the functionality was expanded (for example, adding / removing / creating files, etc.), it makes sense to move the logic into separate services-classes.
