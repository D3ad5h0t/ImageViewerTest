﻿class ViewerTableService {

    public init() {
        const table = document.getElementsByClassName("viewer-table")[0];

        if (table) {
            const rows = table.querySelector("tbody").querySelectorAll("tr");

            rows.forEach(row => {
                row.addEventListener("click", event => {
                    const targetRow = event.currentTarget as HTMLElement;
                    this.selectRow(targetRow);
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

    public selectRow(row: HTMLElement) {
        if (!row.classList.contains("br-primary")) {
            const table = document.getElementsByClassName("viewer-table")[0];
            const oldSelectedRow = table.querySelector(".bg-primary");

            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }

            row.classList.add("bg-primary");
        }
    }

    public visualizeData(files: Array<BaseElement>) {
        const tbody = document.querySelector(".viewer-table").querySelector("tbody");

        if (tbody) {
            files.forEach((file, index) => {
                const row = this.createTableRow(file, index);
                tbody.appendChild(row);
            });

            new ViewerTableService().init();
        }
    }

    public initBlackList(count: number) {
        if (count > -1) {
            const blackList = document.querySelector(".blacklist");

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

    private createTableRow(file: BaseElement, index: number) {

        const tr = document.createElement("tr");

        tr.appendChild(this.getIconCol(file.icon));
        tr.appendChild(this.getTableCell(file.name, 'name'));

        let type = '';
        if (file.type == 'img') {
            type = (file as ImageFile).extension;
        } else {
            type = file.type;
        }
        tr.appendChild(this.getTableCell(type, 'type'));

        tr.appendChild(this.getTableCell(file.size, 'size', " KB"));
        tr.appendChild(this.getTableCell(file.modified, 'modified'));

        if (file.type == 'img') {
            tr.dataset.url = file.url;
            tr.dataset.index = index.toString();
            new ViewerImageService().setEventRowClick(tr);
        }

        return tr;
    }

    private getTableCell(value, name, postfix="") {
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

    private getIconCol(icon: string) {
        if (!icon) {
            icon = "fa-file-alt";
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
        const pagination = document.querySelector(".pagination");

        if (pagination) {
            pagination.innerHTML = '';
            const prev = this.createPaginationItem("&laquo;");
            pagination.appendChild(prev);

            for (let i = 1; i < pageInfo.totalPages + 1; i++) {
                const item = this.getPageNumberItem(i, pageInfo.pageNumber);
                pagination.appendChild(item);
            }

            this.setVisibleNearestPages(pageInfo);

            const next = this.createPaginationItem("&raquo");
            pagination.appendChild(next);

            return pagination;
        }
    }

    private setVisibleNearestPages(pageInfo: PageInfo) {
        const currentPage = document.querySelector(".page-item.active");

        if (currentPage) {
            currentPage.classList.remove("hidden-item");

            if (pageInfo.pageNumber > 1 && pageInfo.pageNumber < pageInfo.totalPages) {
                document.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)?.classList.remove("hidden-item");
                document.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)?.classList.remove("hidden-item");
            } else if (pageInfo.pageNumber == 1) {
                document.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)?.classList.remove("hidden-item");
                document.querySelector(`.page-item-${pageInfo.pageNumber + 2}`)?.classList.remove("hidden-item");
            } else if (pageInfo.pageNumber == pageInfo.totalPages) {
                document.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)?.classList.remove("hidden-item");
                document.querySelector(`.page-item-${pageInfo.pageNumber - 2}`)?.classList.remove("hidden-item");
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