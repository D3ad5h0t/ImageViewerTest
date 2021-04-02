class ImageViewer {

    static offset = [0, 0];
    static mousePosition: number[];
    static dataList: ImageFile[] = [];
    static imgTable: HTMLElement;
    static imgContainer: HTMLElement;
    static controlsContainer: HTMLElement;
    static img: HTMLImageElement;
    defaultImgPath = "/images/nothing-to-see.jpg";

    public init(zoomContainer: string, tableId: string) {
        ImageViewer.imgContainer = document.querySelector(`#${zoomContainer}`) as HTMLElement;
        ImageViewer.controlsContainer = ImageViewer.imgContainer.querySelector("#controls-container") as HTMLElement;
        ImageViewer.imgTable = OverviewTable.getTable(tableId);

        if (ImageViewer.imgContainer) {
            ImageViewer.img = ImageViewer.imgContainer.querySelector("#img-zoom") as HTMLImageElement;
            const maxHeight = ImageViewer.img.offsetHeight;

            ImageViewer.imgContainer.style.height = `${maxHeight}px`;
            ImageViewer.img.style.width = "100%";

            this.setWheelZooming(ImageViewer.imgContainer, ImageViewer.img);
            this.setMoveDirections(ImageViewer.imgContainer, ImageViewer.img);
        }

        this.setControlPanelEvents();
    }

    private setMoveDirections(container: HTMLElement, img: HTMLImageElement) {
        container.addEventListener("mousedown", event => {

            if (event.button == 0) {
                (event as Event).preventDefault();
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
                    const row = ImageViewer.imgTable.querySelector("tr[data-index='" + ImageViewer.dataList.indexOf(item) + "']") as HTMLElement;
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
                    const row = ImageViewer.imgTable.querySelector("tr[data-index='" + ImageViewer.dataList.indexOf(item) + "']") as HTMLElement;
                    OverviewTable.selectRow(row);
                });
            });
        }
    }

    private startTrackingMouseMovement(event: MouseEvent) {
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

    private showControlPanel() {
        if (!ImageViewer.img.src.includes(this.defaultImgPath)) {
            ImageViewer.controlsContainer.style.visibility = "initial";
        }
    }

    private hideControlPanel(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.classList.contains("img-control-btn") &&
            !target.classList.contains("controls-container") &&
            !target.classList.contains("img-zoom") &&
            !target.classList.contains("fas") &&
            !target.classList.contains("download-link")) {
            ImageViewer.controlsContainer.style.visibility = "hidden";
        }
    }

    private async getPrevImage() {
        const selectedRow = ImageViewer.imgTable.querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            const currentIndex = +selectedRow.dataset['index'];

            if (currentIndex && currentIndex >= 0 && currentIndex < ImageViewer.dataList.length) {
                const row = ImageViewer.dataList[currentIndex - 1];
                return row;
            }
        }
    }

    private async getNextImage() {
        const selectedRow = ImageViewer.imgTable.querySelector(".bg-primary") as HTMLElement;

        if (selectedRow && selectedRow.dataset) {
            let currentIndex = parseInt(selectedRow.dataset['index']);

            if (currentIndex >= 0 && currentIndex + 1 < ImageViewer.dataList.length) {
                currentIndex++;
                const row = ImageViewer.dataList[currentIndex];
                return row;
            }
        }
    }

    private downloadSelectedImage(event: Event) {
        if (ImageViewer.img) {
            const link = document.createElement('a');
            link.href = ImageViewer.img.src;
            link.download = ImageViewer.img.src;
            document.body.appendChild(link);
            (link as HTMLElement).classList.add("download-link");
            link.click();
            document.body.removeChild(link);
        }
    }

    public reverseImage() {
        if (ImageViewer.img) {
            ImageViewer.img.style.width = "100%";
            ImageViewer.img.style.left = "0px";
            ImageViewer.img.style.top = "0px";
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
            const image = ImageViewer.dataList[index];
            new ImageViewer().showSelected(image);
        }
    }

    public showSelected(image: ImageFile) {
        if (ImageViewer.img) {
            const uploading = document.querySelector("#img-uploading") as HTMLElement;
            if (uploading) {
                uploading.style.display = 'block';
            }

            ImageViewer.img.style.width = "100%";
            ImageViewer.img.style.left = "0px";
            ImageViewer.img.style.top = "0px";

            ImageViewer.img.addEventListener("load",
                () => {
                    const maxHeight = (ImageViewer.img as HTMLElement).offsetHeight;
                    ImageViewer.imgContainer.style.height = `${maxHeight}px`;
                    uploading.style.display = 'none';
                });

            ImageViewer.img.src = image['url'];
        }
    }

    public initData(data: ImageFile[]) {
        if (data && data.length > 0) {
            ImageViewer.dataList = data;
        }
    }
}