var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ViewerImageService {
    constructor() {
        this.defaultImgPath = "/images/nothing-to-see.jpg";
    }
    init(zoomContainer, tableId) {
        ViewerImageService.imgContainer = document.querySelector(`#${zoomContainer}`);
        ViewerImageService.controlsContainer = ViewerImageService.imgContainer.querySelector("#controls-container");
        ViewerImageService.imgTable = ViewerTableService.getTable(tableId);
        if (ViewerImageService.imgContainer) {
            ViewerImageService.img = ViewerImageService.imgContainer.querySelector("#img-zoom");
            const maxHeight = ViewerImageService.img.offsetHeight;
            ViewerImageService.imgContainer.style.height = `${maxHeight}px`;
            ViewerImageService.img.style.width = "100%";
            this.setWheelZooming(ViewerImageService.imgContainer, ViewerImageService.img);
            this.setMoveDirections(ViewerImageService.imgContainer, ViewerImageService.img);
        }
        this.setControlPanelEvents();
    }
    setMoveDirections(container, img) {
        container.addEventListener("mousedown", event => {
            if (event.button == 0) {
                event.preventDefault();
                ViewerImageService.offset = [
                    img.offsetLeft - event.clientX,
                    img.offsetTop - event.clientY
                ];
                container.addEventListener("mousemove", this.startTrackingMouseMovement, true);
            }
            return false;
        });
        container.addEventListener("mouseup", event => {
            if (event.button == 0) {
                container.removeEventListener("mousemove", this.startTrackingMouseMovement, true);
            }
        });
        container.addEventListener("mouseout", () => {
            container.removeEventListener("mousemove", this.startTrackingMouseMovement, true);
        });
        container.addEventListener("mouseenter", this.showControlPanel, true);
        container.addEventListener("mouseleave", this.hideControlPanel, true);
    }
    setWheelZooming(container, img) {
        const zoomStep = 10;
        container.addEventListener("wheel", event => {
            event.preventDefault();
            if (img.src.includes(this.defaultImgPath)) {
                return;
            }
            const currentWidth = +img.style.width.replace("%", "");
            if (event.deltaY < 0 && currentWidth < 500) {
                img.style.width = `${currentWidth + zoomStep}%`;
            }
            if (event.deltaY > 0 && currentWidth > 100) {
                img.style.width = `${currentWidth - zoomStep}%`;
            }
            const leftOffset = (container.offsetWidth - img.offsetWidth) / 2 + "px";
            const topOffset = (container.offsetHeight - img.offsetHeight) / 2 + "px";
            img.style.left = leftOffset;
            img.style.top = topOffset;
        });
    }
    setControlPanelEvents() {
        const downloadBtn = ViewerImageService.controlsContainer.querySelector("#download-btn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", this.downloadSelectedImage);
        }
        const reverseBtn = ViewerImageService.controlsContainer.querySelector("#reverse-btn");
        if (reverseBtn) {
            reverseBtn.addEventListener("click", this.reverseImage);
        }
        const prevBtn = ViewerImageService.controlsContainer.querySelector("#prev-btn");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.getPrevImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = ViewerImageService.imgTable.querySelector("tr[data-index='" + ViewerImageService.dataList.indexOf(item) + "']");
                    ViewerTableService.selectRow(row);
                });
            });
        }
        const nextBtn = ViewerImageService.controlsContainer.querySelector("#next-btn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                this.getNextImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = ViewerImageService.imgTable.querySelector("tr[data-index='" + ViewerImageService.dataList.indexOf(item) + "']");
                    ViewerTableService.selectRow(row);
                });
            });
        }
    }
    startTrackingMouseMovement(event) {
        const maxHeight = ViewerImageService.imgContainer.offsetHeight - ViewerImageService.img.offsetHeight;
        const maxWidth = ViewerImageService.imgContainer.offsetWidth - ViewerImageService.img.offsetWidth;
        const currentWidth = +ViewerImageService.img.style.width.replace("%", "");
        if (currentWidth > 100) {
            ViewerImageService.mousePosition = [
                event.clientX,
                event.clientY
            ];
            const leftOffset = ViewerImageService.mousePosition[0] + ViewerImageService.offset[0];
            const topOffset = ViewerImageService.mousePosition[1] + ViewerImageService.offset[1];
            if (leftOffset > maxWidth && leftOffset < 0) {
                ViewerImageService.img.style.left = leftOffset + 'px';
            }
            if (topOffset > maxHeight && topOffset < 0) {
                ViewerImageService.img.style.top = topOffset + 'px';
            }
        }
    }
    showControlPanel() {
        if (!ViewerImageService.img.src.includes(this.defaultImgPath)) {
            ViewerImageService.controlsContainer.style.visibility = "initial";
        }
    }
    hideControlPanel(event) {
        const target = event.target;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            ViewerImageService.controlsContainer.style.visibility = "hidden";
        }
    }
    getPrevImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = ViewerImageService.imgTable.querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                const currentIndex = +selectedRow.dataset['index'];
                if (currentIndex && currentIndex >= 0 && currentIndex < ViewerImageService.dataList.length) {
                    const row = ViewerImageService.dataList[currentIndex - 1];
                    return row;
                }
            }
        });
    }
    getNextImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = ViewerImageService.imgTable.querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                let currentIndex = parseInt(selectedRow.dataset['index']);
                if (currentIndex >= 0 && currentIndex + 1 < ViewerImageService.dataList.length) {
                    currentIndex++;
                    const row = ViewerImageService.dataList[currentIndex];
                    return row;
                }
            }
        });
    }
    downloadSelectedImage(event) {
        if (ViewerImageService.img) {
            const link = document.createElement('a');
            link.href = ViewerImageService.img.src;
            link.download = ViewerImageService.img.src;
            document.body.appendChild(link);
            link.classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }
    reverseImage() {
        if (ViewerImageService.img) {
            ViewerImageService.img.style.width = "100%";
            ViewerImageService.img.style.left = "0px";
            ViewerImageService.img.style.top = "0px";
        }
    }
    setEventRowClick(row) {
        if (row) {
            row.addEventListener('click', this.handleRowSelection, false);
        }
    }
    handleRowSelection(event) {
        const target = event.currentTarget;
        if (target) {
            const index = target === null || target === void 0 ? void 0 : target.dataset['index'];
            const image = ViewerImageService.dataList[index];
            new ViewerImageService().showSelected(image);
        }
    }
    showSelected(image) {
        if (ViewerImageService.img) {
            const uploading = document.querySelector("#img-uploading");
            if (uploading) {
                uploading.style.display = 'block';
            }
            ViewerImageService.img.style.width = "100%";
            ViewerImageService.img.style.left = "0px";
            ViewerImageService.img.style.top = "0px";
            ViewerImageService.img.addEventListener("load", () => {
                const maxHeight = ViewerImageService.img.offsetHeight;
                ViewerImageService.imgContainer.style.height = `${maxHeight}px`;
                uploading.style.display = 'none';
            });
            ViewerImageService.img.src = image['url'];
        }
    }
    initData(data) {
        if (data && data.length > 0) {
            ViewerImageService.dataList = data;
        }
    }
}
ViewerImageService.offset = [0, 0];
ViewerImageService.dataList = [];
//# sourceMappingURL=viewer-image-service.js.map