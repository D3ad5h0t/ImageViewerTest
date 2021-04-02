var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ImageViewer {
    constructor() {
        this.defaultImgPath = "/images/nothing-to-see.jpg";
    }
    init(zoomContainer, tableId) {
        ImageViewer.imgContainer = document.querySelector(`#${zoomContainer}`);
        ImageViewer.controlsContainer = ImageViewer.imgContainer.querySelector("#controls-container");
        ImageViewer.imgTable = OverviewTable.getTable(tableId);
        if (ImageViewer.imgContainer) {
            ImageViewer.img = ImageViewer.imgContainer.querySelector("#img-zoom");
            const maxHeight = ImageViewer.img.offsetHeight;
            ImageViewer.imgContainer.style.height = `${maxHeight}px`;
            ImageViewer.img.style.width = "100%";
            this.setWheelZooming(ImageViewer.imgContainer, ImageViewer.img);
            this.setMoveDirections(ImageViewer.imgContainer, ImageViewer.img);
        }
        this.setControlPanelEvents();
    }
    setMoveDirections(container, img) {
        container.addEventListener("mousedown", event => {
            if (event.button == 0) {
                event.preventDefault();
                ImageViewer.offset = [
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
        const downloadBtn = ImageViewer.controlsContainer.querySelector("#download-btn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", this.downloadSelectedImage);
        }
        const reverseBtn = ImageViewer.controlsContainer.querySelector("#reverse-btn");
        if (reverseBtn) {
            reverseBtn.addEventListener("click", this.reverseImage);
        }
        const prevBtn = ImageViewer.controlsContainer.querySelector("#prev-btn");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.getPrevImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = ImageViewer.imgTable.querySelector("tr[data-index='" + ImageViewer.dataList.indexOf(item) + "']");
                    OverviewTable.selectRow(row);
                });
            });
        }
        const nextBtn = ImageViewer.controlsContainer.querySelector("#next-btn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                this.getNextImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = ImageViewer.imgTable.querySelector("tr[data-index='" + ImageViewer.dataList.indexOf(item) + "']");
                    OverviewTable.selectRow(row);
                });
            });
        }
    }
    startTrackingMouseMovement(event) {
        const maxHeight = ImageViewer.imgContainer.offsetHeight - ImageViewer.img.offsetHeight;
        const maxWidth = ImageViewer.imgContainer.offsetWidth - ImageViewer.img.offsetWidth;
        const currentWidth = +ImageViewer.img.style.width.replace("%", "");
        if (currentWidth > 100) {
            ImageViewer.mousePosition = [
                event.clientX,
                event.clientY
            ];
            const leftOffset = ImageViewer.mousePosition[0] + ImageViewer.offset[0];
            const topOffset = ImageViewer.mousePosition[1] + ImageViewer.offset[1];
            if (leftOffset > maxWidth && leftOffset < 0) {
                ImageViewer.img.style.left = leftOffset + 'px';
            }
            if (topOffset > maxHeight && topOffset < 0) {
                ImageViewer.img.style.top = topOffset + 'px';
            }
        }
    }
    showControlPanel() {
        if (!ImageViewer.img.src.includes(this.defaultImgPath)) {
            ImageViewer.controlsContainer.style.visibility = "initial";
        }
    }
    hideControlPanel(event) {
        const target = event.target;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            ImageViewer.controlsContainer.style.visibility = "hidden";
        }
    }
    getPrevImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = ImageViewer.imgTable.querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                const currentIndex = +selectedRow.dataset['index'];
                if (currentIndex && currentIndex >= 0 && currentIndex < ImageViewer.dataList.length) {
                    const row = ImageViewer.dataList[currentIndex - 1];
                    return row;
                }
            }
        });
    }
    getNextImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = ImageViewer.imgTable.querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                let currentIndex = parseInt(selectedRow.dataset['index']);
                if (currentIndex >= 0 && currentIndex + 1 < ImageViewer.dataList.length) {
                    currentIndex++;
                    const row = ImageViewer.dataList[currentIndex];
                    return row;
                }
            }
        });
    }
    downloadSelectedImage(event) {
        if (ImageViewer.img) {
            const link = document.createElement('a');
            link.href = ImageViewer.img.src;
            link.download = ImageViewer.img.src;
            document.body.appendChild(link);
            link.classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }
    reverseImage() {
        if (ImageViewer.img) {
            ImageViewer.img.style.width = "100%";
            ImageViewer.img.style.left = "0px";
            ImageViewer.img.style.top = "0px";
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
            const image = ImageViewer.dataList[index];
            new ImageViewer().showSelected(image);
        }
    }
    showSelected(image) {
        if (ImageViewer.img) {
            const uploading = document.querySelector("#img-uploading");
            if (uploading) {
                uploading.style.display = 'block';
            }
            ImageViewer.img.style.width = "100%";
            ImageViewer.img.style.left = "0px";
            ImageViewer.img.style.top = "0px";
            ImageViewer.img.addEventListener("load", () => {
                const maxHeight = ImageViewer.img.offsetHeight;
                ImageViewer.imgContainer.style.height = `${maxHeight}px`;
                uploading.style.display = 'none';
            });
            ImageViewer.img.src = image['url'];
        }
    }
    initData(data) {
        if (data && data.length > 0) {
            ImageViewer.dataList = data;
        }
    }
}
ImageViewer.offset = [0, 0];
ImageViewer.dataList = [];
//# sourceMappingURL=image-viewer-service.js.map