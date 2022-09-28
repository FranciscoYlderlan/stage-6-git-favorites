export class Router {
    templates = {};

    add (route, path) {
        this.templates[route] = path;
    }
};

export const router = new Router();
router.add("row", "../templates/row.html");