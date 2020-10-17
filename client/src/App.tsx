import React, {Component} from 'react';
const API_URL = "http://localhost:5000/barks";
class App extends Component<any, any> {
    skip = 0;
    limit = 10;
    loading = false;
    finished = false;

    state: {[key:string]: any} = {
        barks: [""],
        errorStyle: {
            display:"none"
        },
        errorMessage: "",
        loadingStyle: {
            display: "none"
        }
    }

    constructor(props: any) {
        super(props);
        this.getBarks = this.getBarks.bind(this);
    }

    componentDidMount() {
        this.getBarks();
        if(!this.state.intervalIsSet){
            let interval = setInterval(this.getBarks, 2000);
            this.setState({intervalIsSet:interval});
        }
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
                let visible;
                if(!result.meta.has_more) {
                    visible = "hidden";
                    this.finished = true;
                }else {
                    visible = "visible"
                }
                this.loading = false;
                this.setState({
                    barks: result.barks,
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
            }).catch(errorMessage => {
                this.setState({
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
        let barks = this.state.barks.map((bark: any) => {
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
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css"></link>
                <main>
                    <form id="bark-form" className="bark-form" onSubmit={(event) => this.handleSubmit(event)}>
                        <div style={this.state.errorStyle} className="error-message">{this.state.errorMessage}</div>
                        <label htmlFor="name">Name</label>
                        <input className="u-full-width" type="text" id="name" name="name"/>
                        <label htmlFor="content">Bark</label>
                        <input className="u-full-width" type="text" id="content" name="content"/>
                        <button className="button-primary">Send your Bark!</button>
                    </form>
                    <div className="button-container"/>
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
