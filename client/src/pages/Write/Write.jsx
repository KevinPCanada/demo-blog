import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Write.css";

const Write = () => {
  const [value, setValue] = useState("");

  return (
    <div className="add">
      <div className="content">
        <input type="text" placeholder="Title" name="" id="" />
        <div className="editorContainer">
          <ReactQuill theme="snow" value={value} onChange={setValue} />
        </div>
      </div>
      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status:</b> Draft
          </span>
          <span>
            <b>Visibility:</b> Public
          </span>
          <input style={{ display: "none" }} type="file" name="" id="file" />
          <label className="upload-label" htmlFor="file">
            Upload Image
          </label>
        </div>
        <div className="item">
          <h1>Topic</h1>

          <label htmlFor="culture">
            Culture
            <input type="radio" name="topic" value="culture" id="culture" />
          </label>

          <label htmlFor="food">
            Food
            <input type="radio" name="topic" value="food" id="food" />
          </label>

          <label htmlFor="tv">
            TV
            <input type="radio" name="topic" value="tv" id="tv" />
          </label>

          <label htmlFor="tech">
            Tech
            <input type="radio" name="topic" value="tech" id="tech" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Write;
