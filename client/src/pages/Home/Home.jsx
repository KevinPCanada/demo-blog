import React from "react";
import { Link } from "react-router-dom";
import './Home.css'
import HomeCard from "../../components/HomeCard/HomeCard";

const Home = () => {
  // Dummy database
  const posts = [
    {
      id: 1,
      title:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente",
      desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente, esse dignissimos tempora, at ullam nesciunt nulla suscipit beatae iure eos optio quibusdam perferendis!",
      img: "http://images.pexels.com/photos/26694160/pexels-photo-26694160/free-photo-of-man-standing-on-seashore-in-istanbul-in-turkey.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 2,
      title:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente",
      desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente, esse dignissimos tempora, at ullam nesciunt nulla suscipit beatae iure eos optio quibusdam perferendis!",
      img: "https://images.pexels.com/photos/27367001/pexels-photo-27367001/free-photo-of-a-surfer-is-riding-a-wave-in-the-ocean.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 3,
      title:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente",
      desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi asperiores minima ducimus placeat aspernatur pariatur sapiente",
      img: "https://images.pexels.com/photos/5566694/pexels-photo-5566694.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  return (
    <div className="Home">
      <div className="posts">
        {posts.map((post) => (
          <HomeCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
