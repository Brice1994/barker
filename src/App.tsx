import React, {Component} from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/barks';

class App extends Component<any, any> {
    skip = 0;
    limit = 5;
    loading = false;
    finished = false;

    state: {[key:string]: any} = {
        barks: [""],
        formStyle: {
            display: ""
        },
        errorStyle: {
            display:"none"
        },
        errorMessage: "",
        loadingStyle: {
            display: "none"
        }
    }
    componentDidMount() {
        const loadingElement = document.querySelector("#loadMore");
        document.addEventListener("scroll", () => {
            const rect = loadingElement!.getBoundingClientRect();
            if(rect.top < window.innerHeight && !this.loading && !this.finished){
                this.getBarks();
            }
        })
        this.getBarks()
    }
    loadMore() {
        this.skip+= this.limit;
        this.getBarks(false);
    }
    getBarks(reset = true){
        this.loading = true;
        if(reset){
            this.skip = 0;
            this.finished = false;
        }
        fetch(`${API_URL}?skip=${this.skip}&limit=${this.limit}`)
            .then(res => res.json())
            .then(result => {
                let curr = this.state.barks;
                console.log(curr);
                curr.push(...result.barks);
                let visible;
                if(!result.meta.has_more) {
                    visible = "hidden";
                    this.finished = true;
                }else {
                    visible = "visible"
                }
                this.loading = false;
                this.setState({
                    barks: curr,
                    loadingStyle: {visibility: visible}
                })
            });

    }
    handleSubmit(e: any){
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get("name");
        const content = formData.get("content");
        if(name?.toString().trim() && content?.toString().trim()){
            this.setState({
                errorStyle: { display: "none"},
                formStyle: {display: "none"},
                loadingStyle: {display: ""}
            });
            const bark = {
                name,
                content
            }
            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify(bark),
                headers: {
                    'content-type' : "application/json"
                }
            }).then(response => {
                if(!response.ok){
                    const contentType = response.headers.get("content-type");
                    if(contentType!.includes("json")){
                        return response.json().then(err => Promise.reject(err.message));
                    }else {
                        return response.text().then(msg => Promise.reject(msg));
                    }
                }
            }).then(() => {
                const form = document.getElementById("bark-form") as HTMLFormElement
                form!.reset();
                setTimeout(() => {
                    this.setState({
                        formStyle: {display:""}
                    });
                }, 30000);
                this.getBarks();
            }).catch(errorMessage => {
                this.setState({
                    formStyle: {display:""},
                    errorStyle: {display:"none"},
                    loadingStyle: {display:"none"},
                    errorMessage: errorMessage
                })
            })
        } else {
            this.setState({
                errorMessage: "Missing name and content!",
                errorStyle: {display:""}
            })
        }
    }
    render() {
        let barks = this.state.barks.slice(1).map((bark: any) => {
            return (
                <div>
                    <h3>{bark.name}</h3>
                    <p>{bark.content}</p>
                    <small>{new Date(bark.created).toString()}</small>
                </div>
            )
        })
        return (
            <div className="App">
                <main>
                    <form style={this.state.formStyle} id="bark-form" className="bark-form" onSubmit={(event) => this.handleSubmit(event)}>
                        <div style={this.state.errorStyle} className="error-message">{this.state.errorMessage}</div>
                        <label htmlFor="name">Name</label>
                        <input className="u-full-width" type="text" id="name" name="name"/>
                        <label htmlFor="content">Bark</label>
                        <input className="u-full-width" type="text" id="content" name="content"/>
                        <button className="button-primary">Send your Bark!</button>
                    </form>
                    <div className="button-container">
                        <p style={this.state.loadingStyle} id="loadMore">Loading...</p>
                    </div>
                    <div className="barks">{barks}</div>
                    <div className="loading">
                        <img src="images/loading.gif" alt=""/>
                    </div>
                </main>
            </div>
        );
    }

}

export default App;
