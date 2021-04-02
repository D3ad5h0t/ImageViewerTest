class ViewerTableService {

    static tableView: HTMLElement;
    static pagination: HTMLElement;

    public init(tableId: string, paginationId: string) {
        ViewerTableService.tableView = ViewerTableService.getTable(tableId);
        ViewerTableService.pagination = document.querySelector(`#${paginationId}`) as HTMLElement;
    }

    public static getTable(tableId: string) {
        return document.querySelector(`#${tableId}`) as HTMLElement;
    }

    public static selectRow(row: HTMLElement) {
        if (!row.classList.contains("br-primary")) {
            const oldSelectedRow = ViewerTableService.tableView.querySelector(".bg-primary");

            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }

            row.classList.add("bg-primary");
        }
    }

    public visualizeData(files: Array<BaseObject>) {
        const tbody = ViewerTableService.tableView.querySelector("tbody");

        if (tbody) {
            files.forEach((file, index) => {
                const row = this.createTableRow(file, index);
                tbody.appendChild(row);
            });

            const rows = tbody.querySelectorAll("tr");

            rows.forEach(row => {
                row.addEventListener("click", event => {
                    const targetRow = event.currentTarget as HTMLElement;
                    ViewerTableService.selectRow(targetRow);
                });

                row.addEventListener("dblclick", event => {
                    const row = event.currentTarget as HTMLElement;
                    const type = row.querySelector(".col-type")?.textContent;
                    const folderName = row.querySelector(".col-name")?.textContent;

                    if (type && folderName && type == "folder") {
                        window.location.href = "/pages/image-viewer.html?folder=" + folderName;
                    }
                });
            });
        }
    }

    public initBlackList(count: number) {
        if (count > -1) {
            const blackList = document.querySelector("#blacklist");

            if (blackList.children.length > 1) {
                return;
            }

            for (let i = 1; i < count + 1; i++) {
                const option = document.createElement("option") as HTMLOptionElement;
                option.value = i.toString();
                option.textContent = i.toString();
                blackList.appendChild(option);
            }
        }
    }

    private createTableRow(file: BaseObject, index: number) {

        const tr = document.createElement("tr");

        tr.appendChild(this.getIconCol(file.type));
        tr.appendChild(this.getTableCell(file.name, 'name'));

        let type = 'file';

        switch (file.type) {
            case ObjectType.Image:
                {
                    type = (file as ImageFile).extension;
                    break;
                }
            case ObjectType.Folder:
                {
                    type = "folder";
                    break;
                }
        }

        tr.appendChild(this.getTableCell(type, 'type'));

        tr.appendChild(this.getTableCell(file.size, 'size', " KB"));
        tr.appendChild(this.getTableCell(file.modified, 'modified'));

        if (file.type == ObjectType.Image) {
            tr.dataset.url = file.url;
            tr.dataset.index = index.toString();
            new ViewerImageService().setEventRowClick(tr);
        }

        return tr;
    }

    private getTableCell(value, name, postfix = "") {
        const td = document.createElement("td") as HTMLElement;
        td.classList.add(`col-${name}`);
        let content = '';

        if (name == 'modified') {
            content = this.formatDate(value);
        } else {
            content = value + postfix;
        }

        td.textContent = content;

        return td;
    }

    private formatDate(date) {
        let formatedDate = new Date(date);
        let month = (formatedDate.getMonth() + 1).toString();
        let day = formatedDate.getDate().toString();
        let year = formatedDate.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }

        if (day.length < 2) {
            day = '0' + day;
        }

        const newDate = `${year}-${month}-${day}`;
        const newTime = `${formatedDate.getHours()}:${formatedDate.getMinutes()}:${formatedDate.getSeconds()}`;

        return newDate + ' ' + newTime;
    }

    private getIconCol(type: ObjectType) {
        let icon = "fa-file-alt";

        switch (type) {
            case ObjectType.Folder: {
                icon = "fa-folder";
                break;
            }
            case ObjectType.Image: {
                icon = "fa-file-image";
                break;
            }
        }

        const th = document.createElement("th") as HTMLElement;
        th.classList.add("col-icon");

        const i = document.createElement("i") as HTMLElement;
        i.classList.add("far");
        i.classList.add(icon);

        th.appendChild(i);
        return th;
    }

    public setPagination(pageInfo: PageInfo) {
        if (ViewerTableService.pagination) {
            ViewerTableService.pagination.innerHTML = '';
            const prev = this.createPaginationItem("&laquo;");
            ViewerTableService.pagination.appendChild(prev);

            for (let i = 1; i < pageInfo.totalPages + 1; i++) {
                const item = this.getPageNumberItem(i, pageInfo.pageNumber);
                ViewerTableService.pagination.appendChild(item);
            }

            this.setVisibleNearestPages(pageInfo);

            const next = this.createPaginationItem("&raquo");
            ViewerTableService.pagination.appendChild(next);

            return ViewerTableService.pagination;
        }
    }

    private setVisibleNearestPages(pageInfo: PageInfo) {
        const currentPage = ViewerTableService.pagination.querySelector(".page-item.active");

        if (currentPage) {
            currentPage.classList.remove("hidden-item");

            if (pageInfo.pageNumber > 1 && pageInfo.pageNumber < pageInfo.totalPages) {
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)?.classList.remove("hidden-item");
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)?.classList.remove("hidden-item");
            } else if (pageInfo.pageNumber == 1) {
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)?.classList.remove("hidden-item");
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 2}`)?.classList.remove("hidden-item");
            } else if (pageInfo.pageNumber == pageInfo.totalPages) {
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)?.classList.remove("hidden-item");
                ViewerTableService.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 2}`)?.classList.remove("hidden-item");
            }
        }
    }

    private getPageNumberItem(number, currentNumber): HTMLElement {
        const item = this.createPaginationItem(number.toString());
        item.classList.add("hidden-item");

        if (number === currentNumber) {
            item.classList.add("active");
        }

        return item;
    }

    private createPaginationItem(content: string): HTMLElement {
        const item = document.createElement("li") as HTMLElement;
        item.classList.add("page-item");
        item.classList.add(`page-item-${content}`);

        const a = document.createElement("a") as HTMLElement;
        a.classList.add("page-link");

        const span = document.createElement("span") as HTMLElement;
        span.setAttribute("aria-hidden", "true");
        span.innerHTML = content;

        a.appendChild(span);
        item.appendChild(a);

        return item;
    }
}