class LoadingService {
    static start() {
        const container = document.querySelector(".loading-container");
        if (container) {
            container.style.display = 'block';
        }
    }
    static finish() {
        const container = document.querySelector(".loading-container");
        if (container) {
            setTimeout(() => {
                container.style.display = 'none';
            }, 1000);
        }
    }
}
//# sourceMappingURL=loading-service.js.map