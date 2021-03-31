class ViewerTableService {
    init() {
        const table = document.getElementsByClassName("viewer-table")[0];
        if (table) {
            const rows = table.querySelector("tbody").querySelectorAll("tr");
            rows.forEach(row => {
                row.addEventListener("click", event => {
                    const targetRow = event.currentTarget;
                    this.selectRow(targetRow);
                });
                row.addEventListener("dblclick", event => {
                    var _a, _b;
                    const row = event.currentTarget;
                    const type = (_a = row.querySelector(".col-type")) === null || _a === void 0 ? void 0 : _a.textContent;
                    const folderName = (_b = row.querySelector(".col-name")) === null || _b === void 0 ? void 0 : _b.textContent;
                    if (type && folderName && type == "folder") {
                        window.location.href = "/pages/image-viewer.html?folder=" + folderName;
                    }
                });
            });
        }
    }
    selectRow(row) {
        if (!row.classList.contains("br-primary")) {
            const table = document.getElementsByClassName("viewer-table")[0];
            const oldSelectedRow = table.querySelector(".bg-primary");
            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }
            row.classList.add("bg-primary");
        }
    }
    visualizeData(files) {
        const tbody = document.querySelector(".viewer-table").querySelector("tbody");
        if (tbody) {
            files.forEach((file, index) => {
                const row = this.createTableRow(file, index);
                tbody.appendChild(row);
            });
            new ViewerTableService().init();
        }
    }
    initBlackList(count) {
        if (count > -1) {
            const blackList = document.querySelector(".blacklist");
            if (blackList.children.length > 1) {
                return;
            }
            for (let i = 1; i < count + 1; i++) {
                const option = document.createElement("option");
                option.value = i.toString();
                option.textContent = i.toString();
                blackList.appendChild(option);
            }
        }
    }
    createTableRow(file, index) {
        const tr = document.createElement("tr");
        tr.appendChild(this.getIconCol(file.icon));
        tr.appendChild(this.getTableCell(file.name, 'name'));
        let type = '';
        if (file.type == 'img') {
            type = file.extension;
        }
        else {
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
    getTableCell(value, name, postfix = "") {
        const td = document.createElement("td");
        td.classList.add(`col-${name}`);
        let content = '';
        if (name == 'modified') {
            content = this.formatDate(value);
        }
        else {
            content = value + postfix;
        }
        td.textContent = content;
        return td;
    }
    formatDate(date) {
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
    getIconCol(icon) {
        if (!icon) {
            icon = "fa-file-alt";
        }
        const th = document.createElement("th");
        th.classList.add("col-icon");
        const i = document.createElement("i");
        i.classList.add("far");
        i.classList.add(icon);
        th.appendChild(i);
        return th;
    }
    setPagination(pageInfo) {
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
    setVisibleNearestPages(pageInfo) {
        var _a, _b, _c, _d, _e, _f;
        const currentPage = document.querySelector(".page-item.active");
        if (currentPage) {
            currentPage.classList.remove("hidden-item");
            if (pageInfo.pageNumber > 1 && pageInfo.pageNumber < pageInfo.totalPages) {
                (_a = document.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden-item");
                (_b = document.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden-item");
            }
            else if (pageInfo.pageNumber == 1) {
                (_c = document.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)) === null || _c === void 0 ? void 0 : _c.classList.remove("hidden-item");
                (_d = document.querySelector(`.page-item-${pageInfo.pageNumber + 2}`)) === null || _d === void 0 ? void 0 : _d.classList.remove("hidden-item");
            }
            else if (pageInfo.pageNumber == pageInfo.totalPages) {
                (_e = document.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)) === null || _e === void 0 ? void 0 : _e.classList.remove("hidden-item");
                (_f = document.querySelector(`.page-item-${pageInfo.pageNumber - 2}`)) === null || _f === void 0 ? void 0 : _f.classList.remove("hidden-item");
            }
        }
    }
    getPageNumberItem(number, currentNumber) {
        const item = this.createPaginationItem(number.toString());
        item.classList.add("hidden-item");
        if (number === currentNumber) {
            item.classList.add("active");
        }
        return item;
    }
    createPaginationItem(content) {
        const item = document.createElement("li");
        item.classList.add("page-item");
        item.classList.add(`page-item-${content}`);
        const a = document.createElement("a");
        a.classList.add("page-link");
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.innerHTML = content;
        a.appendChild(span);
        item.appendChild(a);
        return item;
    }
}
//# sourceMappingURL=viewer-table-service.js.map