// client/src/pages/Write/Write.jsx
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill's CSS
import "./Write.css"; // Your custom CSS
import { useNavigate } from 'react-router-dom';

const Write = () => {
  const [title, setTitle] = useState('');
  const [quillValue, setQuillValue] = useState(""); // For ReactQuill content (HTML)
  const [description, setDescription] = useState(''); // New field for short description
  const [category, setCategory] = useState(""); // For topic/category radio buttons
  const [file, setFile] = useState(null); // For the image file

  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Function to handle file upload (same as before)
  const uploadImage = async () => {
    if (!file) return null;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:8800/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      setIsUploading(false);
      if (!res.ok) throw new Error(data.message || 'Image upload failed');
      return data.filePath;
    } catch (err) {
      setIsUploading(false);
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to upload image.');
      throw err;
    }
  };

   const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (isSubmitting || isUploading) return;

    setError(null);
    setIsSubmitting(true);

    if (!title || !quillValue || !description || !category) {
      setError("Title, Description, Content, and Topic are required.");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = '';
    try {
      if (file) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // The 'date' field is no longer created or sent from the frontend
      const postData = {
        title,
        content: quillValue,
        description,
        img: imageUrl,
        category,
        // No 'date' field here!
      };

      const response = await fetch('http://localhost:8800/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        credentials: 'include',
      });

      // ... (rest of the response handling and catch block remains the same as refined previously)
      if (!response.ok) {
        let errorPayload;
        try {
            errorPayload = await response.json();
        } catch (parseError) {
            const errorText = await response.text();
            errorPayload = { message: errorText };
        }
        throw errorPayload; // Throw the payload directly to be caught
      }

      const responseData = await response.json();
      console.log('Post created:', responseData);
      setIsSubmitting(false);
      navigate('/');

    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to create post (raw error object):', err);
      const backendErrorMessage = err.sqlMessage || err.message; // Try to get specific messages
      if (!error) {
          setError(backendErrorMessage || "An error occurred. Check console for details.");
      } else {
          console.error("Post creation specific error:", backendErrorMessage);
      }
    }
  };

  // Modules for ReactQuill (optional, customize as needed)
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'], // 'image' in Quill toolbar usually means pasting URL or base64.
                         // Our dedicated "Upload Image" button is separate.
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    // It's good practice to have a <form> tag if you have a submit button,
    // or ensure your button explicitly calls handleSubmit onClick without being type="submit"
    // Here, we'll add an invisible submit button triggered by the "Publish" button in the menu.
    <form onSubmit={handleSubmit} className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* Adding a Description field */}
        <textarea
            placeholder="Short Description (excerpt for cards, SEO, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
                padding: '10px',
                fontSize: '16px',
                fontFamily: 'var(--body-font)',
                border: '2px solid var(--border-color)',
                backgroundColor: '#fff',
                color: 'var(--text-color)',
                outline: 'none',
                marginBottom: '15px',
                resize: 'vertical'
            }}
        />
        <div className="editorContainer">
          <ReactQuill
            theme="snow"
            value={quillValue}
            onChange={setQuillValue}
            modules={quillModules}
            formats={quillFormats}
          />
        </div>
      </div>

      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status:</b> Draft {/* You can make this dynamic later */}
          </span>
          <span>
            <b>Visibility:</b> Public {/* You can make this dynamic later */}
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file" // Ensure ID matches label's htmlFor
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/png, image/jpeg, image/gif"
          />
          <label className="upload-label" htmlFor="file">
            {file ? `Image: ${file.name.substring(0, 20)}...` : "Upload Image"}
          </label>
          {/* Display loading/error states related to uploads/submission */}
          {isUploading && <p style={{fontSize: '14px', margin: '5px 0'}}>Uploading image...</p>}
          {error && <p style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>Error: {error}</p>}

          {/* Publish Buttons - using your CSS structure for buttons */}
          <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <button type="submit" disabled={isUploading || isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Now'}
            </button>
            {/* <button type="button" onClick={() => console.log("Save Draft clicked")}>
              Save Draft
            </button> */}
          </div>
        </div>

        <div className="item">
          <h1>Topic</h1>
          <div className="topic-options"> {/* Added a wrapper for better structure if needed */}
            {['Culture', 'Food', 'TV', 'Tech', 'Lifestyle'].map((cat) => ( // More dynamic way
                <label htmlFor={cat.toLowerCase()} key={cat}>
                    {cat}
                    <input
                        type="radio"
                        name="topic" // Same name for all radio buttons in a group
                        value={cat.toLowerCase()} // Value to be stored in state
                        id={cat.toLowerCase()}
                        checked={category === cat.toLowerCase()}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default Write;