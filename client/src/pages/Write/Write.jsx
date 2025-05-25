// client/src/pages/Write/Write.jsx
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Write.css";
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

const Write = () => {
  const location = useLocation(); // Get location object
  const postToEdit = location.state; // Post data passed from Single.jsx

  const [title, setTitle] = useState('');
  const [quillValue, setQuillValue] = useState("");
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null); // For a new image file
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // To store existing image path

  // --- Quill Modules ---
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'], // Note: ReactQuill's built-in image handler usually inserts base64 or asks for a URL. Your separate file upload is for the main post image.
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];
  // --- END of Quill Modules ---

  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const backendUrl = "http://localhost:8800"; // Define backend URL

  // Check if in edit mode and populate fields
  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setQuillValue(postToEdit.content || '');
      setDescription(postToEdit.description || '');
      setCategory(postToEdit.category || '');
      if (postToEdit.img) {
        setCurrentImageUrl(postToEdit.img); // Store existing image path
      }
    } else {
      // Reset fields if not editing (e.g., navigating directly to /write)
      setTitle('');
      setQuillValue('');
      setDescription('');
      setCategory('');
      setCurrentImageUrl('');
      setFile(null);
    }
  }, [postToEdit]); // Re-run if postToEdit changes

  const uploadImage = async () => {
    // ... (your existing uploadImage function is good, just ensure it uses backendUrl)
    if (!file) return null;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${backendUrl}/api/upload`, { // Use backendUrl
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure your backend /api/upload handles credentials if needed
      });
      const data = await res.json();
      setIsUploading(false);
      if (!res.ok) throw new Error(data.message || 'Image upload failed');
      return data.filePath; // This should be the path like /uploads/filename.jpg
    } catch (err) {
      setIsUploading(false);
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to upload image.');
      throw err; // Re-throw to be caught by handleSubmit
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

    let finalImageUrl = currentImageUrl; // Default to existing image

    try {
      if (file) { // If a new file is selected, upload it
        const newImagePath = await uploadImage();
        if (newImagePath) {
          finalImageUrl = newImagePath; // Use the new image path
        } else {
          // Image upload failed, but a file was selected.
          // If uploadImage throws an error, it will be caught below.
          // If it returns null without error (e.g. no file was actually selected despite `file` being truthy),
          // we might fall back to currentImageUrl or handle as error.
          // Given uploadImage throws on error, this path might not be hit if an error occurs.
          // If uploadImage returns null and no error, it means `!file` was true initially.
        }
      }

      const postData = {
        title,
        content: quillValue,
        description,
        img: finalImageUrl, // Use final (new or existing) image URL
        category,
      };

      let response;
      if (postToEdit && postToEdit.id) { // EDIT MODE
        response = await fetch(`${backendUrl}/api/posts/${postToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
          credentials: 'include',
        });
      } else { // CREATE MODE
        response = await fetch(`${backendUrl}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
          credentials: 'include',
        });
      }

      if (!response.ok) {
        let errorPayload;
        try {
          errorPayload = await response.json();
        } catch (parseError) {
          errorPayload = { message: await response.text() };
        }
        throw errorPayload;
      }

      const responseData = await response.json();
      setIsSubmitting(false);

      if (postToEdit && postToEdit.id) {
        console.log('Post updated:', responseData);
        navigate(`/post/${postToEdit.id}`); // Navigate to the updated post
      } else {
        console.log('Post created:', responseData);
        navigate('/'); // Navigate to homepage after creation
      }

    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to submit post (raw error object):', err);
      const backendErrorMessage = err.sqlMessage || err.message;
      // setError is already set by uploadImage if that fails, so only set if it's a submission error
      if (!error) { // Only set if setError wasn't called by uploadImage
          setError(backendErrorMessage || "An error occurred. Check console for details.");
      }
    }
  };

  // ... (quillModules, quillFormats, and JSX return statement) ...
  // In your JSX, you might want to:
  // 1. Change the submit button text:
  //    <button type="submit" disabled={isUploading || isSubmitting}>
  //      {isSubmitting ? (postToEdit ? 'Updating...' : 'Publishing...') : (postToEdit ? 'Update Post' : 'Publish Now')}
  //    </button>
  // 2. Display the current image if editing:
  //    {currentImageUrl && !file && (
  //      <div className="image-preview">
  //        <p>Current Image:</p>
  //        <img src={`${backendUrl}${currentImageUrl}`} alt="Current post" style={{maxWidth: '200px', maxHeight: '200px'}}/>
  //      </div>
  //    )}
  //    <label className="upload-label" htmlFor="file">
  //      {file ? `New: ${file.name.substring(0,20)}...` : (currentImageUrl ? 'Change Image' : 'Upload Image')}
  //    </label>

  // --- Your existing JSX return ---
  // Remember to adapt button texts and image preview as suggested above if you like.
  return (
    <form onSubmit={handleSubmit} className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Short Description (excerpt for cards, SEO, etc.)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={{ /* your styles */ }}
        />
        <div className="editorContainer">
          <ReactQuill
            theme="snow"
            value={quillValue}
            onChange={setQuillValue}
            modules={quillModules} // Make sure these are defined
            formats={quillFormats} // Make sure these are defined
          />
        </div>
      </div>

      <div className="menu">
        <div className="item">
          <h1>{postToEdit ? "Update Status" : "Publish"}</h1>
          <span><b>Status:</b> Draft</span>
          <span><b>Visibility:</b> Public</span>
          
          {currentImageUrl && !file && ( // Display current image if editing and no new file selected
            <div className="image-preview" style={{marginBottom: '10px'}}>
              <p style={{fontSize: '14px', fontWeight: 'bold'}}>Current Image:</p>
              <img src={`${backendUrl}${currentImageUrl}`} alt="Current post" style={{maxWidth: '100%', maxHeight: '150px', objectFit: 'cover', border: '1px solid #ddd'}}/>
            </div>
          )}

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => {
                setFile(e.target.files[0]);
                // Optionally clear currentImageUrl if you want the preview to disappear once a new file is chosen
                // setCurrentImageUrl(''); 
            }}
            accept="image/png, image/jpeg, image/gif"
          />
          <label className="upload-label" htmlFor="file">
            {file ? `Selected: ${file.name.substring(0, 20)}...` : (currentImageUrl ? 'Change Image' : 'Upload Image')}
          </label>

          {isUploading && <p style={{fontSize: '14px', margin: '5px 0'}}>Uploading image...</p>}
          {error && <p style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>Error: {error}</p>}

          <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <button type="submit" disabled={isUploading || isSubmitting}>
              {isSubmitting ? (postToEdit ? 'Updating...' : 'Publishing...') : (postToEdit ? 'Update Post' : 'Publish Now')}
            </button>
          </div>
        </div>

        <div className="item">
          <h1>Topic</h1>
          <div className="topic-options">
            {['Culture', 'Food', 'TV', 'Tech', 'Lifestyle'].map((cat) => (
              <label htmlFor={cat.toLowerCase()} key={cat}>
                {cat}
                <input
                  type="radio"
                  name="topic"
                  value={cat.toLowerCase()}
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