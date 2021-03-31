var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DataService {
    getImages(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("/api/images?folder=" + folder, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            if (response.ok) {
                const images = yield response.json();
                return images;
            }
        });
    }
    getFolders(page, blacklistNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("/api/folders?page=" + page + "&blacklistNumber=" + blacklistNumber, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            if (response.ok) {
                const pageInfo = yield response.json();
                return pageInfo;
            }
        });
    }
}
//# sourceMappingURL=data-service.js.map