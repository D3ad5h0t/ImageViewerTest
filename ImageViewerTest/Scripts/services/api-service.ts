class Api {
    public async images(folder: string): Promise<Array<ImageFile>> {
        const response = await fetch("/api/images?folder=" + folder,
            {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

        if (response.ok) {
            const images = await response.json();
            return images;
        }
    }

    public async folders(page: number, blacklistNumber: number): Promise<PageInfo> {
        const response = await fetch("/api/folders?page=" + page + "&blacklistNumber=" + blacklistNumber,
            {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

        if (response.ok) {
            const pageInfo = await response.json();
            return pageInfo;
        }
    }
}