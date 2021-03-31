var offset = [0, 0];
var mousePosition;
const defaultImgPath = "/images/nothing-to-see.jpg";
let dataList: ImageFile[] = [];

class ViewerImageService {

    public init() {
        const imgContainer = document.querySelector(".img-zoom-container") as HTMLElement;

        if (imgContainer) {
            const img = imgContainer.querySelector("img") as HTMLImageElement;
            const maxHeight = img.offsetHeight;

            imgContainer.style.height = `${maxHeight}px`;
            img.style.width = "100%";

            this.setWheelZooming(imgContainer, img);
            this.setMoveDirections(imgContainer, img);
        }

        this.setControlPanelEvents();
    }

    private setMoveDirections(container: HTMLElement, img: HTMLImageElement) {
        container.addEventListener("mousedown", event => {

            if (event.button == 0) {
                (event as Event).preventDefault();
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

    private setWheelZooming(container: HTMLElement, img: HTMLImageElement) {
        const zoomStep = 10;

        container.addEventListener("wheel", event => {
            (event as Event).preventDefault();

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

    private setControlPanelEvents() {
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
                    const row = document.querySelector("tr[data-index='" + dataList.indexOf(item) + "']") as HTMLElement;
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
                    const row = document.querySelector("tr[data-index='" + dataList.indexOf(item) + "']") as HTMLElement;
                    this.selectRow(row);
                });
            });
        }
    }

    private selectRow(row: HTMLElement) {
        if (row && !row.classList.contains("br-primary")) {
            const table = document.getElementsByClassName("viewer-table")[0];
            const oldSelectedRow = table.querySelector(".bg-primary");

            if (oldSelectedRow) {
                oldSelectedRow.classList.remove("bg-primary");
            }

            row.classList.add("bg-primary");
        }
    }

    private startTrackingMouseMovement(event: MouseEvent) {
        const container = document.querySelector(".img-zoom-container") as HTMLElement;
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

    private showControlPanel() {
        const img = document.querySelector(".img-zoom") as HTMLImageElement;

        if (!img.src.includes(defaultImgPath)) {
            const container = document.querySelector(".controls-container") as HTMLElement;
            container.style.visibility = "initial";
        }
    }

    private hideControlPanel(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            const container = document.querySelector(".controls-container") as HTMLElement;
            container.style.visibility = "hidden";
        }
    }

    private async getPrevImage() {
        const selectedRow = document.querySelector(".viewer-table").querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            const currentIndex = +selectedRow.dataset['index'];

            if (currentIndex && currentIndex >= 0 && currentIndex < dataList.length) {
                const row = dataList[currentIndex - 1];
                return row;
            }
        }
    }

    private async getNextImage() {
        const selectedRow = document.querySelector(".viewer-table").querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            let currentIndex = parseInt(selectedRow.dataset['index']);

            if (currentIndex >= 0 && currentIndex + 1 < dataList.length) {
                currentIndex++;
                const row = dataList[currentIndex];
                return row;
            }
        }
    }

    private downloadSelectedImage(event: Event) {
        const selectedImg = document.querySelector(".img-zoom") as HTMLImageElement;

        if (selectedImg) {
            const link = document.createElement('a');
            link.href = selectedImg.src;
            link.download = selectedImg.src;
            document.body.appendChild(link);
            (link as HTMLElement).classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }

    public reverseImage() {
        const selectedImg = document.querySelector(".img-zoom") as HTMLElement;

        if (selectedImg) {
            selectedImg.style.width = "100%";
            selectedImg.style.left = "0px";
            selectedImg.style.top = "0px";
        }
    }

    public setEventRowClick(row: HTMLElement) {
        if (row) {
            row.addEventListener('click', this.handleRowSelection, false);
        }
    }

    handleRowSelection(event: Event) {
        const target = event.currentTarget as HTMLElement;

        if (target) {
            const index = target?.dataset['index'];
            const image = dataList[index];
            new ViewerImageService().showSelected(image);
        }
    }

    public showSelected(image: ImageFile) {
        const img = document.querySelector(".img-zoom") as HTMLImageElement;

        if (img) {
            const uploading = document.querySelector(".img-uploading") as HTMLElement;
            if (uploading) {
                uploading.style.display = 'block';
            }

            img.style.width = "100%";
            img.style.left = "0px";
            img.style.top = "0px";

            img.addEventListener("load",
                () => {
                    const maxHeight = (img as HTMLElement).offsetHeight;
                    const container = document.querySelector(".img-zoom-container") as HTMLElement;
                    container.style.height = `${maxHeight}px`;
                    uploading.style.display = 'none';
                });

            img.src = image['url'];
        }
    }

    public initData(data: ImageFile[]) {
        if (data && data.length > 0) {
            dataList = data;
        }
    }
}