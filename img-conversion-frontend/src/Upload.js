import React from 'react';
import axios from 'axios';
import FileDownload from 'js-file-download';

export default class Upload extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            totalFiles: 0,
            selectedFile: [],
            loaded:0,
            uploadStatus: false,
            uploadMessage: null,
            downloadStatus: false,
            downloadMessage: null,
            convertMessage:null,
        }
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        this.convertHandler = this.convertHandler.bind(this);
    }
    onChangeHandler = event => {
        event.preventDefault();
        let numberOfFiles = event.target.files.length;
        let newArray = [];
        for(let i = 0; i < numberOfFiles; i++){
            newArray[i] = event.target.files[i];
        }
        this.setState({
            totalFiles: numberOfFiles,
            selectedFile: newArray,
            loaded: 0,
        });
    }
    onClickHandler = () => {
        const data = new FormData();
        let numberOfFiles = this.state.totalFiles;
        for(let i = 0; i < numberOfFiles; i++){
            let file_i = this.state.selectedFile[i];
            data.append('files', file_i);
        }
        axios.post('http://localhost:5050/upload', data, {

        }).then(res => {
                console.log(res.statusText);
                if(res.statusText === "OK"){
                    this.setState({
                        uploadStatus: !this.state.uploadStatus,
                        uploadMessage: this.state.totalFiles+' have been uploaded'

                    })
                } else {
                    this.setState({
                        uploadMessage: 'Upload error'
                    })
                }
            });

    }
convertHandler = () => {
    axios.get('http://localhost:5050/convert')
         .then(res => {
             this.setState({
                convertMessage: res.data
            })
        }
    )
}

downloadHandler = () => {
        axios.get('http://localhost:5050/download', {
            responseType : "arraybuffer"
        })
            .then(res => {
                FileDownload(res.data, 'convertedImages.zip')
            })
}
    render() {
        if(this.state.uploadStatus) {
            return (
                <div className='App'>
                    <h3>This is my first React Application</h3>
                    <input type='file' multiple onChange={this.onChangeHandler}/>
                    <button onClick={this.onClickHandler}>Upload</button>
                    <h4>{this.state.totalFiles} files have been uploaded</h4>
                    <div>
                        <h5>
                            <button onClick={this.convertHandler}>Convert Files</button>
                        </h5>
                        <h6>{this.state.convertMessage}</h6>
                    </div>

                    <div>
                        <h4>
                            <button onClick={this.downloadHandler}>Download Zip</button>
                        </h4>
                    </div>
                </div>
            )
        }
        else{
            return(
                <div className = 'App'>
                    <h3>This is my first React Application</h3>
                    <input type='file' multiple onChange={this.onChangeHandler} />
                    <button onClick={this.onClickHandler}>Upload</button>
                </div>
            )
        }
    }
}

