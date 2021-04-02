class ViewerImageService {

    static offset = [0, 0];
    static mousePosition: number[];
    static dataList: ImageFile[] = [];
    static imgTable: HTMLElement;
    static imgContainer: HTMLElement;
    static controlsContainer: HTMLElement;
    static img: HTMLImageElement;
    defaultImgPath = "/images/nothing-to-see.jpg";

    public init(zoomContainer: string, tableId: string) {
        ViewerImageService.imgContainer = document.querySelector(`#${zoomContainer}`) as HTMLElement;
        ViewerImageService.controlsContainer = ViewerImageService.imgContainer.querySelector("#controls-container") as HTMLElement;
        ViewerImageService.imgTable = ViewerTableService.getTable(tableId);

        if (ViewerImageService.imgContainer) {
            ViewerImageService.img = ViewerImageService.imgContainer.querySelector("#img-zoom") as HTMLImageElement;
            const maxHeight = ViewerImageService.img.offsetHeight;

            ViewerImageService.imgContainer.style.height = `${maxHeight}px`;
            ViewerImageService.img.style.width = "100%";

            this.setWheelZooming(ViewerImageService.imgContainer, ViewerImageService.img);
            this.setMoveDirections(ViewerImageService.imgContainer, ViewerImageService.img);
        }

        this.setControlPanelEvents();
    }

    private setMoveDirections(container: HTMLElement, img: HTMLImageElement) {
        container.addEventListener("mousedown", event => {

            if (event.button == 0) {
                (event as Event).preventDefault();
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

    private setWheelZooming(container: HTMLElement, img: HTMLImageElement) {
        const zoomStep = 10;

        container.addEventListener("wheel", event => {
            (event as Event).preventDefault();

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

    private setControlPanelEvents() {
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
                    const row = ViewerImageService.imgTable.querySelector("tr[data-index='" + ViewerImageService.dataList.indexOf(item) + "']") as HTMLElement;
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
                    const row = ViewerImageService.imgTable.querySelector("tr[data-index='" + ViewerImageService.dataList.indexOf(item) + "']") as HTMLElement;
                    ViewerTableService.selectRow(row);
                });
            });
        }
    }

    private startTrackingMouseMovement(event: MouseEvent) {
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

    private showControlPanel() {
        if (!ViewerImageService.img.src.includes(this.defaultImgPath)) {
            ViewerImageService.controlsContainer.style.visibility = "initial";
        }
    }

    private hideControlPanel(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            ViewerImageService.controlsContainer.style.visibility = "hidden";
        }
    }

    private async getPrevImage() {
        const selectedRow = ViewerImageService.imgTable.querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            const currentIndex = +selectedRow.dataset['index'];

            if (currentIndex && currentIndex >= 0 && currentIndex < ViewerImageService.dataList.length) {
                const row = ViewerImageService.dataList[currentIndex - 1];
                return row;
            }
        }
    }

    private async getNextImage() {
        const selectedRow = ViewerImageService.imgTable.querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            let currentIndex = parseInt(selectedRow.dataset['index']);

            if (currentIndex >= 0 && currentIndex + 1 < ViewerImageService.dataList.length) {
                currentIndex++;
                const row = ViewerImageService.dataList[currentIndex];
                return row;
            }
        }
    }

    private downloadSelectedImage(event: Event) {
        if (ViewerImageService.img) {
            const link = document.createElement('a');
            link.href = ViewerImageService.img.src;
            link.download = ViewerImageService.img.src;
            document.body.appendChild(link);
            (link as HTMLElement).classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }

    public reverseImage() {
        if (ViewerImageService.img) {
            ViewerImageService.img.style.width = "100%";
            ViewerImageService.img.style.left = "0px";
            ViewerImageService.img.style.top = "0px";
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
            const image = ViewerImageService.dataList[index];
            new ViewerImageService().showSelected(image);
        }
    }

    public showSelected(image: ImageFile) {
        if (ViewerImageService.img) {
            const uploading = document.querySelector("#img-uploading") as HTMLElement;
            if (uploading) {
                uploading.style.display = 'block';
            }

            ViewerImageService.img.style.width = "100%";
            ViewerImageService.img.style.left = "0px";
            ViewerImageService.img.style.top = "0px";

            ViewerImageService.img.addEventListener("load",
                () => {
                    const maxHeight = (ViewerImageService.img as HTMLElement).offsetHeight;
                    ViewerImageService.imgContainer.style.height = `${maxHeight}px`;
                    uploading.style.display = 'none';
                });

            ViewerImageService.img.src = image['url'];
        }
    }

    public initData(data: ImageFile[]) {
        if (data && data.length > 0) {
            ViewerImageService.dataList = data;
        }
    }
}