import { router } from "./router.js";


export class GithubUsers {
    static async search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        const result = await fetch(endpoint);
        const { name, login, public_repos, followers } = await result.json();
        return ({
            name,
            login,
            public_repos,
            followers
        }); 
    }
}

class GitFavorites {
    constructor (root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem("git-users-searched")) || [];
    }

    async add(login) {
        try {
            const user = await GithubUsers.search(login);
            
            if(this.entries.some(user => user.login === login)) throw("Usuário já cadastrado.");
            
            if(user.name == undefined) throw("Usuário não encontrado.");

            this.entries = [user, ... this.entries];

            this.update().then(this.save());
        } catch (error) {
            alert(error)
        }
    
    }
    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login != user.login);

        this.entries = filteredEntries;

        this.update().then(this.save());
    }
    save(){
        localStorage.setItem("git-users-searched", JSON.stringify(this.entries))
    }
}

export class GitFavoritesView extends GitFavorites {
    constructor(root){
        super(root);

        this.tbody = this.root.querySelector("tbody");
        
        this.btnSearch = document.querySelector(".search button");
        this.btnSearch.onclick = () => this.onAdd();
        
        window.document.onkeyup = event => event.key === "Enter"? this.onAdd(): null;

        this.update().then(this.save());
    } 
    
    async update() {
        this.eraseAllRows();
        this.removeMsgIsEmpty();
        
        if(this.entries.length == 0) {
            this.showMsgIsEmpty()
        }
        
        this.entries.forEach(async user => {
            const row = await this.buildRow(user);
            row.querySelector("button").onclick = () => {
                const isOk = confirm("Tem certeza que deseja deletar esse registro?");
                if(isOk) this.delete(user);
            }
            this.tbody.append(row)
        })
    }


    onAdd() {
        const search = this.root.querySelector(".search");
        const input = search.querySelector("input");
        this.add(input.value).then(input.value = "");
    }

    async buildRow(user) {
        
        const response = await fetch(router.templates.row);
        
        const text = await response.text();
        
        const tr = document.createElement("tr");
        
        tr.innerHTML = text;

        tr.querySelector('a').href = `https://github.com/${user.login}`;
        tr.querySelector('img').src = `https://github.com/${user.login}.png`;
        tr.querySelector('img').alt = `Imagem de ${user.name}`;
        tr.querySelector('.name').textContent = user.name;
        tr.querySelector('.username').textContent = `/${user.login}`;
        tr.querySelector('.repositories').textContent = user.public_repos;
        tr.querySelector('.followers').textContent = user.followers;
        
        return tr;        
    }


    eraseAllRows(){
        const rows = this.root.querySelectorAll("tbody tr");
        rows.forEach(row => row.remove());
    }
    showMsgIsEmpty() {
        const emptyMsg = this.root.querySelector(".empty-table");
        emptyMsg.classList.remove("hide");
    }
    removeMsgIsEmpty() {
        const emptyMsg = this.root.querySelector(".empty-table");
        emptyMsg.classList.add("hide");
    }


}
