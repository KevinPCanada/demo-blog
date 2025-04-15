import React from 'react';
import { Link } from 'react-router-dom';
import './HomeCard.css';

const HomeCard = ({ post }) => {
  return (
    <div className="post">
      <div className="img">
        <img src={post.img} alt={post.title} />
      </div>
      <div className="content">
        <Link className="link" to={`/post/${post.id}`}>
          <h1>{post.title}</h1>
        </Link>
        <p>{post.desc}</p>
        <Link className="link" to={`/post/${post.id}`}>
          <button>Read More</button>
        </Link>
      </div>
    </div>
  );
};

export default HomeCard;
