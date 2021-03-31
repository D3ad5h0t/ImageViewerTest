class LoadingService {
    public static start() {
        const container = document.querySelector(".loading-container") as HTMLElement;
        if (container) {
            container.style.display = 'block';
        }
    }

    public static finish() {
        const container = document.querySelector(".loading-container") as HTMLElement;
        if (container) {
            setTimeout(() => {
                    container.style.display = 'none';
                },
                1000);
        }
    }
}