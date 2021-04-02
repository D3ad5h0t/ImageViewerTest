class OverviewTable {
    init(tableId, paginationId) {
        OverviewTable.tableView = OverviewTable.getTable(tableId);
        OverviewTable.pagination = document.querySelector(`#${paginationId}`);
    }
    static getTable(tableId) {
        return document.querySelector(`#${tableId}`);
    }
    static selectRow(row) {
        if (!row.classList.contains("br-primary")) {
            const oldSelectedRow = OverviewTable.tableView.querySelector(".bg-primary");
            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }
            row.classList.add("bg-primary");
        }
    }
    visualizeData(files) {
        const tbody = OverviewTable.tableView.querySelector("tbody");
        if (tbody) {
            files.forEach((file, index) => {
                const row = this.createTableRow(file, index);
                tbody.appendChild(row);
            });
            const rows = tbody.querySelectorAll("tr");
            rows.forEach(row => {
                row.addEventListener("click", event => {
                    const targetRow = event.currentTarget;
                    OverviewTable.selectRow(targetRow);
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
    initBlackList(count) {
        if (count > -1) {
            const blackList = document.querySelector("#blacklist");
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
        tr.appendChild(this.getIconCol(file.type));
        tr.appendChild(this.getTableCell(file.name, 'name'));
        let type = 'file';
        switch (file.type) {
            case ObjectType.Image:
                {
                    type = file.extension;
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
            new ImageViewer().setEventRowClick(tr);
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
        let formattedDate = new Date(date);
        let month = (formattedDate.getMonth() + 1).toString();
        let day = formattedDate.getDate().toString();
        let year = formattedDate.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        const newDate = `${year}-${month}-${day}`;
        const newTime = `${formattedDate.getHours()}:${formattedDate.getMinutes()}:${formattedDate.getSeconds()}`;
        return newDate + ' ' + newTime;
    }
    getIconCol(type) {
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
        const th = document.createElement("th");
        th.classList.add("col-icon");
        const i = document.createElement("i");
        i.classList.add("far");
        i.classList.add(icon);
        th.appendChild(i);
        return th;
    }
    setPagination(pageInfo) {
        if (OverviewTable.pagination) {
            OverviewTable.pagination.innerHTML = '';
            const prev = this.createPaginationItem("&laquo;");
            OverviewTable.pagination.appendChild(prev);
            for (let i = 1; i < pageInfo.totalPages + 1; i++) {
                const item = this.getPageNumberItem(i, pageInfo.pageNumber);
                OverviewTable.pagination.appendChild(item);
            }
            this.setVisibleNearestPages(pageInfo);
            const next = this.createPaginationItem("&raquo");
            OverviewTable.pagination.appendChild(next);
            return OverviewTable.pagination;
        }
    }
    setVisibleNearestPages(pageInfo) {
        var _a, _b, _c, _d, _e, _f;
        const currentPage = OverviewTable.pagination.querySelector(".page-item.active");
        if (currentPage) {
            currentPage.classList.remove("hidden-item");
            if (pageInfo.pageNumber > 1 && pageInfo.pageNumber < pageInfo.totalPages) {
                (_a = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden-item");
                (_b = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden-item");
            }
            else if (pageInfo.pageNumber == 1) {
                (_c = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 1}`)) === null || _c === void 0 ? void 0 : _c.classList.remove("hidden-item");
                (_d = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber + 2}`)) === null || _d === void 0 ? void 0 : _d.classList.remove("hidden-item");
            }
            else if (pageInfo.pageNumber == pageInfo.totalPages) {
                (_e = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 1}`)) === null || _e === void 0 ? void 0 : _e.classList.remove("hidden-item");
                (_f = OverviewTable.pagination.querySelector(`.page-item-${pageInfo.pageNumber - 2}`)) === null || _f === void 0 ? void 0 : _f.classList.remove("hidden-item");
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
//# sourceMappingURL=overview-table-service.js.map