class BaseElement {
    name: string;

    type: string;

    size: number;

    modified: Date;

    url: string;

    icon?: string;
}

class ImageFile extends BaseElement {
    extension?: string;
}

class Folder extends BaseElement {

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