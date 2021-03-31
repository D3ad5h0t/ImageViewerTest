var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var offset = [0, 0];
var mousePosition;
const defaultImgPath = "/images/nothing-to-see.jpg";
let dataList = [];
class ViewerImageService {
    init() {
        const imgContainer = document.querySelector(".img-zoom-container");
        if (imgContainer) {
            const img = imgContainer.querySelector("img");
            const maxHeight = img.offsetHeight;
            imgContainer.style.height = `${maxHeight}px`;
            img.style.width = "100%";
            this.setWheelZooming(imgContainer, img);
            this.setMoveDirections(imgContainer, img);
        }
        this.setControlPanelEvents();
    }
    setMoveDirections(container, img) {
        container.addEventListener("mousedown", event => {
            if (event.button == 0) {
                event.preventDefault();
                offset = [
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
            if (img.src.includes(defaultImgPath)) {
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
        const downloadBtn = document.querySelector("#download-btn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", this.downloadSelectedImage);
        }
        const reverseBtn = document.querySelector("#reverse-btn");
        if (reverseBtn) {
            reverseBtn.addEventListener("click", this.reverseImage);
        }
        const prevBtn = document.querySelector("#prev-btn");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.getPrevImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = document.querySelector("tr[data-index='" + dataList.indexOf(item) + "']");
                    this.selectRow(row);
                });
            });
        }
        const nextBtn = document.querySelector("#next-btn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                this.getNextImage().then(item => {
                    if (!item) {
                        return;
                    }
                    this.showSelected(item);
                    const row = document.querySelector("tr[data-index='" + dataList.indexOf(item) + "']");
                    this.selectRow(row);
                });
            });
        }
    }
    selectRow(row) {
        if (row && !row.classList.contains("br-primary")) {
            const table = document.getElementsByClassName("viewer-table")[0];
            const oldSelectedRow = table.querySelector(".bg-primary");
            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }
            row.classList.add("bg-primary");
        }
    }
    startTrackingMouseMovement(event) {
        const container = document.querySelector(".img-zoom-container");
        const img = container.querySelector("img");
        const maxHeight = container.offsetHeight - img.offsetHeight;
        const maxWidth = container.offsetWidth - img.offsetWidth;
        const currentWidth = +img.style.width.replace("%", "");
        if (currentWidth > 100) {
            mousePosition = [
                event.clientX,
                event.clientY
            ];
            const leftOffset = mousePosition[0] + offset[0];
            const topOffset = mousePosition[1] + offset[1];
            if (leftOffset > maxWidth && leftOffset < 0) {
                img.style.left = leftOffset + 'px';
            }
            if (topOffset > maxHeight && topOffset < 0) {
                img.style.top = topOffset + 'px';
            }
        }
    }
    showControlPanel() {
        const img = document.querySelector(".img-zoom");
        if (!img.src.includes(defaultImgPath)) {
            const container = document.querySelector(".controls-container");
            container.style.visibility = "initial";
        }
    }
    hideControlPanel(event) {
        const target = event.target;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            const container = document.querySelector(".controls-container");
            container.style.visibility = "hidden";
        }
    }
    getPrevImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = document.querySelector(".viewer-table").querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                const currentIndex = +selectedRow.dataset['index'];
                if (currentIndex && currentIndex >= 0 && currentIndex < dataList.length) {
                    const row = dataList[currentIndex - 1];
                    return row;
                }
            }
        });
    }
    getNextImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedRow = document.querySelector(".viewer-table").querySelector(".bg-primary");
            if (selectedRow && selectedRow.dataset) {
                let currentIndex = parseInt(selectedRow.dataset['index']);
                if (currentIndex >= 0 && currentIndex + 1 < dataList.length) {
                    currentIndex++;
                    const row = dataList[currentIndex];
                    return row;
                }
            }
        });
    }
    downloadSelectedImage(event) {
        const selectedImg = document.querySelector(".img-zoom");
        if (selectedImg) {
            const link = document.createElement('a');
            link.href = selectedImg.src;
            link.download = selectedImg.src;
            document.body.appendChild(link);
            link.classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }
    reverseImage() {
        const selectedImg = document.querySelector(".img-zoom");
        if (selectedImg) {
            selectedImg.style.width = "100%";
            selectedImg.style.left = "0px";
            selectedImg.style.top = "0px";
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
            const image = dataList[index];
            new ViewerImageService().showSelected(image);
        }
    }
    showSelected(image) {
        const img = document.querySelector(".img-zoom");
        if (img) {
            const uploading = document.querySelector(".img-uploading");
            if (uploading) {
                uploading.style.display = 'block';
            }
            img.style.width = "100%";
            img.style.left = "0px";
            img.style.top = "0px";
            img.addEventListener("load", () => {
                const maxHeight = img.offsetHeight;
                const container = document.querySelector(".img-zoom-container");
                container.style.height = `${maxHeight}px`;
                uploading.style.display = 'none';
            });
            img.src = image['url'];
        }
    }
    initData(data) {
        if (data && data.length > 0) {
            dataList = data;
        }
    }
}
//# sourceMappingURL=viewer-image-service.js.map