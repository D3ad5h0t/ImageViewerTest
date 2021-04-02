class BaseObject {
    name: string;

    type: ObjectType;

    size: number;

    modified: Date;

    url: string;

    icon?: string;
}

class ImageFile extends BaseObject {
    extension?: string;
}

class Folder extends BaseObject {

}

class FolderView {
    folders: Array<Folder>;

    pageInfo: PageInfo;

    blackListCount: number;
}

class PageInfo {
    pageNumber: number;

    pageSize: number;

    totalItems: number;

    totalPages: number;
}